$(document).ready(function () {
    let seatmap = new SeatMapCanvas(".seats_container", {
        "seat_style": {
            "radius": 12,
            "color": "#ceeeff",
            "hover": "#b2d945",
            "not_salable": "#0087d0",
            "selected": "#b2d945",
            "focus": "#b2d945",
            "focus_out": "#b2d945"
        },
    });
    seatmap.eventManager.addEventListener("SEAT.CLICK", (seat) => {
        if (!seat.isSelected() && seat.item.salable === true) {
            seat.select();
        } else {
            seat.unSelect();
        }
        basketCalculate()
    });

    let blockButtoClick = function (e) {
        let blockId = parseInt($(this).attr('block-id'));
        seatmap.zoomManager.zoomToBlock(blockId);
    };


    let basketItemClick = function (e) {
        let seatId = parseInt($(this).parent('.basket-item').attr('seat-id'));
        let blockId = parseInt($(this).parent('.basket-item').attr('block-id'));
        let seat = seatmap.data.getSeat(seatId, blockId)
        seat.svg.unSelect();
        basketCalculate()
    };

    let basketCalculate = function () {
        let selectedSeats = seatmap.data.getSelectedSeats();
        let basketItems = [];
        let basketTotal = 0;
        selectedSeats.forEach(function (item) {
            basketTotal += defaultPrice;
            let li = `<div class="basket-item" seat-id="${item.id}" block-id="${item.block.id}">
                    <div class="basket-item-title">${item.title}</div>
                    <div class="basket-item-price">${new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'GBP'}).format(defaultPrice)}</div>
                    <div class="basket-item-remove-btn"><i class="fas fa-times"></i></div>
                </div>`;
            basketItems.push(li);
        });
        if (basketItems.length) {
            $('#basket').html(basketItems.join(''))
            $('.basket-total-price').html(new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'GBP'}).format(basketTotal))
        } else {

            $('#basket').html(`<div class="empty-basket-message">Basket is empty</div>`)

            $('.basket-total-price').html(`£0`)
        }
        $(".basket-item-remove-btn").on("click", basketItemClick);

    };

    $("#zoomout-button").on("click", function () {
        seatmap.zoomManager.zoomToVenue();
    });

    $(".zoom-to-block").on("click", function (e) {
        let blockId = parseInt($(this).attr('block-id'));
        seatmap.zoomManager.zoomToBlock(blockId);
    });
    $("#get-selected-seats").on("click", function (e) {
        e.preventDefault();
        let selectedSeats = seatmap.data.getSelectedSeats();
    });

    $("#filter-on").on("click", function (a) {
        var blocks = seatmap.data.getBlocks().forEach(block => {
            block.seats.forEach(seat => {
                // console.log(seat.tags)
                if (seat.tags.indexOf('disabled') > -1) {
                    seat.selectable = false;
                    seat.salable = false;
                    seat.svg.update()
                }
            })
        });
    });


    let x_gap = 0;
    let y_gap = 0;
    let block_i = 0;

    let random_block_colors = ["#00a5ff", "#fccf4d", "#fccf4d", "#ef255f", "#2c2828", "#ff1f5a", "#fccf4d", "#ef255f"];
    let defaultPrice = 12.5;

    let blockButtons = [];

    let getDummyBlocks = function (count, cb) {
        $.getJSON("data.json", function (result) {
            let blocks = [];

            for (let i = 0; i < count; i++) {

                let labels = [];
                let label_index = {};

                let color = random_block_colors[block_i % random_block_colors.length];

                if (i % 2 === 0) {
                    y_gap += 400;
                    x_gap = 0;
                } else {
                    x_gap += 400;
                }


                let seats = result.seats.map((item, index) => {
                    if (!label_index[item['rowName']]) {
                        let label_data = {
                            title: item['rowName'],
                            x: x_gap,
                            y: item['positionTop'] + y_gap
                        };
                        label_index[item['rowName']] = label_data;
                        labels.push(label_data);
                    }

                    let tags = [];
                    if (index % 2 === 1) {
                        tags.push("disabled");
                    } else {
                        tags.push("normal");
                    }
                    tags.push("row_" + item.rowName);
                    return {
                        id: item.id,
                        x: item['positionLeft'] + x_gap + 40,
                        y: item['positionTop'] + y_gap,
                        color: item.color || color || null,
                        salable: (Math.ceil(Math.random() * 100)) % 2 == 1,
                        note: "note test",
                        tags: tags,
                        title: "Row: " + item.displayName + "\nLine: " + item['rowName']
                    }
                });

                console.log('result.seats', seats.length)

                let blockName = "Block " + (block_i + 1);
                let blockId = block_i + 1;
                let block = {
                    "id": blockId,
                    "title": "Block " + (block_i + 1),
                    "labels": labels,
                    "color": color,
                    "seats": seats
                };


                let block_btn_li = `<div class="block-btn" block-id="${blockId}" style="background-color: ${color}">${blockName}<span class="seat-count">(${seats.length} seats)</span></div>`;
                blockButtons.push(block_btn_li);

                blocks.push(block);
                block_i++;
            }
            $('.block-buttons').html(blockButtons.join(''));
            $('.block-buttons .block-btn').on('click', blockButtoClick);

            cb(blocks);

        });
    };

    getDummyBlocks(2, (blocks) => {
        console.log("adding blocks", blocks.length)
        seatmap.data.addBulkBlock(blocks);
        seatmap.zoomManager.zoomToBlock(1);
        basketCalculate();
    });


});

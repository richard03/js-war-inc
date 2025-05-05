class MarketController {
    constructor(game, model, view) {
        this.game = game;
        this.model = model;
        this.view = view;

        this.update = {
            interval: 5000,
            ref: null
        };
    }

    init() {
        if (this.game.debugMode) console.log('init market controller');

        this.model.init();
        this.view.init();

        // Start price updates
        this.update.ref = setInterval(() => {
            this.model.updatePrices();
            this.view.update(this.assembleViewData());
        }, this.update.interval);

        this.view.getBackButton().addEventListener('click', () => {
            this.hide();
            this.game.controller.menu.show();
        });

        this.view.container.addEventListener('click', (event) => {
            console.log('click');

            const targetButton = event.target.closest('button');

            if (targetButton) {
                console.log("button clicked");
            
                if (targetButton.classList.contains('buy-button')) {
                    console.log("buy button clicked");

                    const corpId = targetButton.dataset.corp;
                    const shareToBuy = 1;  // 1% of total shares
                    this.model.buyShares(corpId, shareToBuy);
                    this.view.update(this.assembleViewData());
                }
                
                if (targetButton.classList.contains('sell-button')) {

                    console.log("sell button clicked");

                    const corpId = targetButton.dataset.corp;
                    const shareToSell = 1;  // 1% of total shares
                    this.model.sellShares(corpId, shareToSell);
                    this.view.update(this.assembleViewData());
                }
            }
            
        });

    }

    show() {
        this.view.show();
        this.view.update(this.assembleViewData());
    }

    assembleViewData() {
        const graphData = this.model.corporations.map(corp => ({
            id: corp.id,
            name: corp.name,
            priceHistory: this.model.priceHistory[corp.id]
        }));
        const viewData = {
            accountBalance: {
                amount: Math.round(this.game.model.accountBallance),
                currency: this.model.currency
            },
            portfolio: this.model.corporations, 
            graph: graphData 
        }
        return viewData;
    }

    hide() {
        this.view.hide();
    }

    destroy() {
        clearInterval(this.update.ref);
    }
    
}

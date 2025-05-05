class MarketModel {
    constructor(game) {
        this.game = game;
        this.currency = "KR";
        this.corporations = [
            { id: 'quantum', name: 'Quantum Dynamics', currentPrice: 1000, ownedShares: 0, totalShares: 100 },
            { id: 'neural', name: 'NeuroTech', currentPrice: 1500, ownedShares: 0, totalShares: 100 },
            { id: 'space', name: 'SpaceEnterprises', currentPrice: 2000, ownedShares: 0, totalShares: 100 },
            { id: 'bio', name: 'BioGen Innovations', currentPrice: 2500, ownedShares: 0, totalShares: 100 },
            { id: 'cyber', name: 'CyberCore Systems', currentPrice: 3000, ownedShares: 0, totalShares: 100 },
            { id: 'ai', name: 'AI Nexus', currentPrice: 3500, ownedShares: 0, totalShares: 100 },
            { id: 'virtual', name: 'VR Systems', currentPrice: 4000, ownedShares: 0, totalShares: 100 },
            { id: 'cybernet', name: 'Cybernetics Unlimited', currentPrice: 4500, ownedShares: 0, totalShares: 100 },
            { id: 'fusion', name: 'Fusion Energy Corp', currentPrice: 5000, ownedShares: 0, totalShares: 100 },
            { id: 'terra', name: 'TerraForm Industries', currentPrice: 1700, ownedShares: 0, totalShares: 100 },          
            { id: 'holo', name: 'HoloTech', currentPrice: 1900, ownedShares: 0, totalShares: 100 },
            { id: 'nano', name: 'Nano Solutions', currentPrice: 2200, ownedShares: 0, totalShares: 100 }/*,
            { id: 'nanomed', name: 'NanoMed', currentPrice: 260, ownedShares: 0, totalShares: 1000 },
            { id: 'quantumai', name: 'Quantum AI Systems', currentPrice: 270, ownedShares: 0, totalShares: 1000 },
            { id: 'spacemin', name: 'Space Mining Corp', currentPrice: 290, ownedShares: 0, totalShares: 1000 },*/
            
        ];
        
        this.priceHistory = {};
        
        
    }

    init() {
        if (this.game.debugMode) console.log('init market model');

        this.corporations.forEach(corp => {
            // Initialize with 20 data points with random variations
            const history = [];
            let currentPrice = corp.currentPrice;
            
            // Generate 20 historical prices with random variations
            for (let i = 0; i < 20; i++) {
                // Add random variation between -5% and +5%
                const change = (Math.random() * 0.1 - 0.05) * currentPrice;
                currentPrice = Math.max(1000, Math.min(9000, currentPrice + change));
                history.push(currentPrice);
            }
            
            // Store the history
            this.priceHistory[corp.id] = history;
            // Update the current price to the last value
            corp.currentPrice = currentPrice;
        });
    }

    updatePrices() {
        this.corporations.forEach(corp => {
            // Generate random price change between -5% and +5%
            const change = (Math.random() * 0.1 - 0.05) * corp.currentPrice;
            const newPrice = Math.max(1000, Math.min(9000, corp.currentPrice + change));
            
            // Update price
            corp.currentPrice = newPrice;
            
            // Add to price history
            this.priceHistory[corp.id].push(newPrice);
            
            // Keep only last 20 prices for graph
            if (this.priceHistory[corp.id].length > 20) {
                this.priceHistory[corp.id].shift();
            }
        });
    }

    /**
     *  Buy shares of a corporation
     * @param {*} corporationId 
     * @param {*} share (1% = share 1)
     * @returns true if successful, false otherwise
     */
    buyShares(corporationId, share) {
        const corp = this.corporations.find(c => c.id === corporationId);
        if (!corp) return false;

        const totalCost = corp.currentPrice * share;
        if (totalCost > this.game.model.accountBallance || (corp.ownedShares + share) > corp.totalShares) {
            return false;
        }

        this.game.model.accountBallance -= totalCost;
        corp.ownedShares += share;
        return true;
    }

    /**
     * Sell shares of a corporation
     * @param {*} corporationId 
     * @param {*} share (1% = share 1)
     * @returns true if successful, false otherwise
     */
    sellShares(corporationId, share) {
        const corp = this.corporations.find(c => c.id === corporationId);
        if (!corp || corp.ownedShares < share) return false;

        const totalValue = corp.currentPrice * share;
        this.game.model.accountBallance += totalValue;
        corp.ownedShares -= share;
        return true;
    }

    /**
     * Get the ownership percentage of a corporation
     * @param {*} corporationId 
     * @returns the ownership percentage
     */
    getOwnershipPercentage(corporationId) {
        const corp = this.corporations.find(c => c.id === corporationId);
        if (!corp) return 0;
        return corp.ownedShares;
    }

    getPortfolioValue() {
        return this.corporations.reduce((total, corp) => {
            return total + (corp.ownedShares * corp.currentPrice);
        }, 0);
    }
}



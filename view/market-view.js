class MarketView {
    constructor(game, model) {
        this.game = game;
        this.model = model;
        
        this.texts = {
            backButton: 'Zpět',
            buyButton: '+',
            sellButton: '-',
            balance: 'Stav účtu',
            corporationColumn: 'Korporace',
            priceColumn: 'Cena 1%',
            ownedColumn: 'Podíl',
            valueColumn: 'Hodnota',
            buyColumn: 'Nákup',
            sellColumn: 'Prodej',
            notEnoughShares: 'Nemáte dostatek akcií!',
            notEnoughFunds: 'Nemáte dostatek peněz!',
            currency: 'KR'
        };

        this.colors = [
            '#FF0000', // Red
            '#00FF00', // Green
            '#0000FF', // Blue
            '#FFFF00', // Yellow
            '#FF00FF', // Magenta
            '#00FFFF', // Cyan
            '#FFA500', // Orange
            '#800080', // Purple
            '#008000', // Dark Green
            '#000080',  // Navy
            '#800000', // Dark Red
            '#008080', // Teal
            '#808000', // Olive
            '#800080', // Purple
            '#008000', // Dark Green
            '#000080'  // Navy

        ];

        this.container = null;
        this.graphCanvas = null;
        this.balanceDisplayElement = null;
        this.tbody = null;
        

    }

    init() {

        this.container = document.createElement('div');
        this.container.className = 'market-container';
        this.container.style.display = 'none';
    
        document.body.appendChild(this.container);

        // Create main layout container
        const mainLayout = document.createElement('div');
        mainLayout.className = 'market-layout';

        // Left panel
        const leftPanel = document.createElement('div');
        leftPanel.className = 'market-left-panel';
        leftPanel.style.width = 'calc(100% - 500px)'; // Fixed width for right panel

        this.createBalanceDisplay();
        leftPanel.appendChild(this.balanceDisplayElement);

        // Portfolio table
        this.createPortfolioTable();
        leftPanel.appendChild(this.portfolioTable);

        // Right panel
        const rightPanel = document.createElement('div');
        rightPanel.className = 'market-right-panel';
        rightPanel.style.width = '600px'; // Fixed width
        rightPanel.style.minWidth = '600px'; // Ensure minimum width
        rightPanel.style.maxWidth = '600px'; // Ensure maximum width

        // Stock graph container
        const graphContainer = document.createElement('div');
        graphContainer.className = 'stock-graph';
        this.graphCanvas = document.createElement('canvas');
        this.graphCanvas.width = 600; // Increased width to match panel
        this.graphCanvas.height = 600;
        graphContainer.appendChild(this.graphCanvas);
        rightPanel.appendChild(graphContainer);

        // Add panels to main layout
        mainLayout.appendChild(leftPanel);
        mainLayout.appendChild(rightPanel);

        // Back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = this.texts.backButton;
        leftPanel.appendChild(backButton);
        
        // Add everything to container
        this.container.appendChild(mainLayout);
    }

    /**
     * Update the UI with the given data
     * @param {*} data 
     * data.portfolio: array of corporations, their share price and total shares
     * data.graph: array of corporations, their share price history
     */
    update(data) {
        // Update balance
        this.updateBalanceDisplay(data.accountBalance);

        // Update portfolio table
        this.updatePortfolioTable(data.portfolio);
        
        // Draw stock graph
        this.updateGraph(data.graph);
    }

    createBalanceDisplay() {
        this.balanceDisplayElement = document.createElement('div');
        this.balanceDisplayElement.className = 'balance-display';
        const balanceElement = document.createElement('span');
        balanceElement.className = 'balance-value';
        this.balanceDisplayElement.innerHTML = `${this.texts.balance}: `;
        this.balanceDisplayElement.appendChild(balanceElement);
    }

    /**
     * Update the balance display with the given account balance
     * @param {*} newAccountBalance 
     */
    updateBalanceDisplay(newAccountBalance) {
        const balanceElement = this.balanceDisplayElement.querySelector('.balance-value');
        balanceElement.textContent = `${newAccountBalance.amount} ${newAccountBalance.currency}`;
    }

    createPortfolioTable() {
        this.portfolioTable = document.createElement('table');
        this.portfolioTable.className = 'portfolio-table';
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>${this.texts.corporationColumn}</th>
                <th>${this.texts.priceColumn}</th>
                <th>${this.texts.ownedColumn}</th>
                <th>${this.texts.valueColumn}</th>
                <th>${this.texts.buyColumn}</th>
                <th>${this.texts.sellColumn}</th>
            </tr>
        `;
        this.portfolioTable.appendChild(thead);
        this.tbody = document.createElement('tbody');
        this.portfolioTable.appendChild(this.tbody);
    }

    /**
     * Update the portfolio table with the given portfolio data
     * @param {*} portfolioData 
     */
    updatePortfolioTable(portfolioData) {
        this.tbody.innerHTML = '';
        portfolioData.forEach(corp => {
            const totalValue = Math.round(corp.ownedShares * corp.currentPrice, 2);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${corp.name}</td>
                <td>${Math.round(corp.currentPrice).toLocaleString()} ${this.texts.currency}</td>
                <td>${corp.ownedShares}%</td>
                <td>${totalValue.toLocaleString()} ${this.texts.currency}</td>
                <td><button class="buy-button" data-corp="${corp.id}">${this.texts.buyButton}</button></td>
                <td><button class="sell-button" data-corp="${corp.id}">${this.texts.sellButton}</button></td>
            `;
            this.tbody.appendChild(row);
        });
    }

    /**
     * Update the prices for all corporations
     */
    updatePrices() {
        this.model.corporations.forEach(corp => {
            // Generate random price change between -5% and +5%
            const change = (Math.random() * 0.1 - 0.05) * corp.currentPrice;
            const newPrice = Math.max(1000, Math.min(9000, corp.currentPrice + change));
            
            // Update price in model
            corp.currentPrice = newPrice;
            
            // Add to price history
            if (!this.model.priceHistory[corp.id]) {
                this.model.priceHistory[corp.id] = [];
            }
            this.model.priceHistory[corp.id].push(newPrice);
            
            // Keep only last 20 prices for graph
            if (this.model.priceHistory[corp.id].length > 20) {
                this.model.priceHistory[corp.id].shift();
            }
        });

        // Update UI
        this.updateUI();
    }

    updateGraph(graphData) {
        const ctx = this.graphCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);

        this.drawGraphGrid();
        this.drawGraphData(graphData);
        this.drawGraphLegend(graphData); 
    }

    drawGraphGrid() {
        const ctx = this.graphCanvas.getContext('2d');

        // Draw grid lines and labels
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        
        const paddingLeft = 50;
        const paddingRight = 50;
        const paddingTop = 20;
        const paddingBottom = 150;
        const graphHeight = this.graphCanvas.height - paddingTop - paddingBottom;
        for (let i = 0; i <= 9; i++) {
            const y = paddingTop + graphHeight * (1 - i/9);
            const price = i * 1000;
            
            // Draw grid line
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(this.graphCanvas.width - paddingRight, y);
            ctx.stroke();

            // Draw price label
            ctx.fillText(price.toLocaleString(), paddingLeft - 5, y + 4);
        }
        // Reset text alignment for future drawings
        ctx.textAlign = 'left';
    }
    
    drawGraphData(graphData) {
        const ctx = this.graphCanvas.getContext('2d');

        const minPrice = 0;
        const maxPrice = 9000;

        const paddingLeft = 50;
        const paddingRight = 50;
        const paddingTop = 20;
        const paddingBottom = 150;
        const graphWidth = this.graphCanvas.width - (paddingLeft + paddingRight);
        const graphHeight = this.graphCanvas.height - paddingTop - paddingBottom;
        // Draw price lines for each corporation
        graphData.forEach((corp, index) => {
            const prices = corp.priceHistory;
            if (!prices || prices.length === 0) return;

            ctx.strokeStyle = this.colors[index];
            ctx.lineWidth = 2;
            ctx.beginPath();

            prices.forEach((price, i) => {
                const x = paddingLeft + (graphWidth * (i / (prices.length - 1)));
                const y = paddingTop + (graphHeight * (1 - (price - minPrice) / (maxPrice - minPrice)));
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        });
        
    }

    drawGraphLegend(graphData) {
        const ctx = this.graphCanvas.getContext('2d');
        
        // Draw grid lines and labels
        ctx.font = '12px Arial';
        const padding = 50;
        const itemsPerRow = 2;
        const legendItemWidth = 250;
        const legendItemHeight = 20;
        const legendStartX = padding;
        
        // Výpočet počtu řádků potřebných pro všechny položky
        const rowsNeeded = Math.ceil(graphData.length / itemsPerRow);
        // Výpočet celkové výšky legendy
        const totalLegendHeight = rowsNeeded * legendItemHeight;
        // Nastavení počáteční pozice Y tak, aby se vešla celá legenda
        const legendStartY = this.graphCanvas.height - totalLegendHeight;

        graphData.forEach((corp, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            const legendX = legendStartX + (col * legendItemWidth);
            const legendY = legendStartY + (row * legendItemHeight);
            
            // Draw color indicator
            ctx.fillStyle = this.colors[index];
            ctx.fillRect(legendX, legendY - 10, 10, 10);
            
            // Draw corporation name
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(corp.name, legendX + 15, legendY);
        });
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    getBackButton() {
        return this.container.querySelector('.back-button');
    }
}



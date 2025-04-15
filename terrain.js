class Terrain {
    constructor(canvasWidth, canvasHeight) {
        this.tileSize = 20;
        this.width = Math.ceil(canvasWidth / this.tileSize) * 10;
        this.height = Math.ceil(canvasHeight / this.tileSize) * 10;
        this.xOffset = Math.random() * 10000;
        this.yOffset = Math.random() * 10000;
        this.heightMap = this.generateHeightMap();
        this.debugMode = true;
    }

    // Generování výškové mapy pomocí Perlinova šumu
    generateHeightMap() {
        const heightMap = new Array(this.height);
        const scale = 0.02;
        const persistence = 0.7;
        const octaves = 5;

        for (let y = 0; y < this.height; y++) {
            heightMap[y] = new Array(this.width);
            for (let x = 0; x < this.width; x++) {
                let amplitude = 1;
                let frequency = 1;
                let noiseHeight = 0;

                for (let i = 0; i < octaves; i++) {
                    const sampleX = (x + this.xOffset) * scale * frequency;
                    const sampleY = (y + this.yOffset) * scale * frequency;
                    
                    const perlinValue = Math.sin(sampleX) * Math.cos(sampleY);
                    noiseHeight += perlinValue * amplitude;
                    
                    amplitude *= persistence;
                    frequency *= 2;
                }

                noiseHeight = (noiseHeight + 1) / 2;
                heightMap[y][x] = noiseHeight;
            }
        }

        return heightMap;
    }

    // Převod výšky na barvu
    getColor(height) {
        // Barvy pro různé výšky (tmavší odstíny)
        const colors = [
            { height: 0.0, color: '#1a3300' },   // Velmi tmavá zelená (nížina)
            { height: 0.3, color: '#2d4d00' },   // Tmavá zelená
            { height: 0.5, color: '#3d6600' },   // Střední zelená
            { height: 0.7, color: '#4d3300' },   // Tmavá hnědá
            { height: 1.0, color: '#663300' }    // Velmi tmavá hnědá (hora)
        ];

        // V debug módu použijeme přesnou barvu bez interpolace
        if (this.debugMode) {
            for (let i = 0; i < colors.length - 1; i++) {
                if (height <= colors[i + 1].height) {
                    return colors[i].color;
                }
            }
            return colors[colors.length - 1].color;
        }

        // Normální režim s interpolací
        let lowerColor = colors[0];
        let upperColor = colors[colors.length - 1];

        for (let i = 0; i < colors.length - 1; i++) {
            if (height >= colors[i].height && height <= colors[i + 1].height) {
                lowerColor = colors[i];
                upperColor = colors[i + 1];
                break;
            }
        }

        const range = upperColor.height - lowerColor.height;
        const factor = (height - lowerColor.height) / range;

        const lowerRGB = this.hexToRgb(lowerColor.color);
        const upperRGB = this.hexToRgb(upperColor.color);

        const r = Math.round(lowerRGB.r + (upperRGB.r - lowerRGB.r) * factor);
        const g = Math.round(lowerRGB.g + (upperRGB.g - lowerRGB.g) * factor);
        const b = Math.round(lowerRGB.b + (upperRGB.b - lowerRGB.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Pomocná funkce pro převod hex na RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Vykreslení terénu
    draw(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const height = this.heightMap[y][x];
                const color = this.getColor(height);
                
                ctx.fillStyle = color;
                ctx.fillRect(
                    x * this.tileSize,
                    y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );

                if (this.debugMode) {
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }
} 
class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.secondaryColor = null;
        
        // Default options
        this.options = {
            particleCount: 5,
            particleSize: { min: 1, max: 3 },
            particleSpeed: { min: 0.2, max: 0.3 },
            particleOpacity: { min: 0.1, max: 0.3 },
            particleColor: 'rgba(187, 64, 236, 0.77)',
            connectionDistance: 1,
            showConnections: false,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.getSecondaryColor();
        this.createCanvas();
        this.createParticles();
        this.animate();
        this.handleResize();
    }
    
    getSecondaryColor() {
        // Get the CSS variable value for secondary color
        const computedStyle = getComputedStyle(document.documentElement);
        const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();
        
        // Convert hex to RGB if needed, or use fallback
        this.secondaryColor = secondaryColor || '#bb40ec';
        
        // Convert hex to RGB values for opacity manipulation
        if (this.secondaryColor.startsWith('#')) {
            const hex = this.secondaryColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            this.secondaryColorRgb = { r, g, b };
        } else {
            // Fallback RGB values
            this.secondaryColorRgb = { r: 187, g: 64, b: 236 };
        }
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Ensure container has relative positioning
        const computedStyle = window.getComputedStyle(this.container);
        if (computedStyle.position === 'static') {
            this.container.style.position = 'relative';
        }
        
        this.container.appendChild(this.canvas);
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * (this.options.particleSize.max - this.options.particleSize.min) + this.options.particleSize.min,
                speedX: (Math.random() - 0.5) * this.options.particleSpeed.max,
                speedY: (Math.random() - 0.5) * this.options.particleSpeed.max,
                opacity: Math.random() * (this.options.particleOpacity.max - this.options.particleOpacity.min) + this.options.particleOpacity.min
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${this.secondaryColorRgb.r}, ${this.secondaryColorRgb.g}, ${this.secondaryColorRgb.b}, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        if (this.options.showConnections) {
            this.drawConnections();
        }
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.connectionDistance) {
                    const opacity = (1 - distance / this.options.connectionDistance) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(${this.secondaryColorRgb.r}, ${this.secondaryColorRgb.g}, ${this.secondaryColorRgb.b}, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Auto-initialize particles on all .grey-section elements
document.addEventListener('DOMContentLoaded', function() {
    const greySections = document.querySelectorAll('.grey-section');
    
    greySections.forEach(section => {
        // Skip if particles already initialized
        if (section.dataset.particlesInitialized) return;
        
        new ParticleSystem(section, {
            particleCount: 40,
            particleSize: { min: 1, max: 4 },
            particleSpeed: { min: 0.2, max: 1 },
            particleOpacity: { min: 0.1, max: 0.4 },
            connectionDistance: 120,
            showConnections: false
        });
        
        section.dataset.particlesInitialized = 'true';
    });
});

// Export for manual initialization if needed
window.ParticleSystem = ParticleSystem;

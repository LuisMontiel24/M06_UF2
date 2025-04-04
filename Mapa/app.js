class App {
    constructor() {
        this.puntosInteres = [];
        this.filteredPuntos = [];
        this.markers = [];
        this.typesSet = new Set();
        
        this.initMap();
        this.initEventListeners();
        this.showCurrentLocation();
    }
    
    initMap() {
        this.map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }
    
    showCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.map.setView([latitude, longitude], 13);
                    L.marker([latitude, longitude])
                        .addTo(this.map)
                        .bindPopup("Estàs aquí")
                        .openPopup();
                },
                () => {
                    this.map.setView([41.3851, 2.1734], 13); // Barcelona per defecte
                }
            );
        } else {
            this.map.setView([41.3851, 2.1734], 13); // Barcelona per defecte
        }
    }
    
    initEventListeners() {
        // Drag and drop
        const dropZone = document.getElementById('dropZone');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('active');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('active');
        });
        
        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('active');
            
            const file = e.dataTransfer.files[0];
            if (!file) return;
            
            if (!file.name.endsWith('.csv')) {
                alert('El fitxer no és csv');
                return;
            }
            
            await this.loadCSV(file);
        });
        
        // Filtres
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.filterByType(e.target.value);
        });
        
        document.getElementById('orderFilter').addEventListener('change', (e) => {
            this.orderByName(e.target.value);
        });
        
        document.getElementById('nameFilter').addEventListener('input', (e) => {
            this.filterByName(e.target.value);
        });
        
        // Botó netejar
        document.getElementById('clearButton').addEventListener('click', () => {
            this.clearList();
        });
    }
    
    async loadCSV(file) {
        try {
            const csvData = await Excel.readCSV(file);
            await this.processCSVData(csvData);
            
            if (csvData.length > 0 && csvData[0].pais) {
                await this.loadCountryInfo(csvData[0].pais);
            }
            
            this.updateUI();
        } catch (error) {
            console.error("Error carregant CSV:", error);
            alert("Error al processar el fitxer CSV");
        }
    }
    
    async processCSVData(csvData) {
        this.puntosInteres = [];
        PuntInteres.totalElements = 0;
        this.typesSet.clear();
        
        csvData.forEach(row => {
            let punto;
            
            switch(row.tipus?.toLowerCase()) {
                case 'atraccio':
                case 'atracc':
                    punto = new Atraccio(row);
                    break;
                case 'museu':
                case 'museum':
                    punto = new Museu(row);
                    break;
                default:
                    punto = new PuntInteres(row);
            }
            
            this.puntosInteres.push(punto);
            if (punto.tipus) this.typesSet.add(punto.tipus);
        });
        
        this.filteredPuntos = [...this.puntosInteres];
    }
    
    async loadCountryInfo(countryCode) {
        const countryInfo = await Excel.getInfoCountry(countryCode);
        if (!countryInfo) return;
        
        const countryDisplay = document.createElement('div');
        countryDisplay.className = 'country-info';
        
        if (countryInfo.flag) {
            const flagImg = document.createElement('img');
            flagImg.src = countryInfo.flag;
            flagImg.className = 'country-flag';
            flagImg.alt = `Bandera de ${countryInfo.city}`;
            countryDisplay.appendChild(flagImg);
        }
        
        const countryText = document.createElement('span');
        countryText.textContent = `País: ${countryInfo.city}`;
        countryDisplay.appendChild(countryText);
        
        const pointsList = document.getElementById('pointsList');
        pointsList.insertBefore(countryDisplay, pointsList.firstChild);
        
        if (countryInfo.lat && countryInfo.long) {
            this.map.setView([countryInfo.lat, countryInfo.long], 11);
        }
    }
    
    updateUI() {
        this.updatePointsList();
        this.showPointsOnMap();
        this.updateTypeFilter();
    }
    
    updatePointsList() {
        const pointsList = document.getElementById('pointsList');
        
        // Conservar la info del país si existeix
        const countryInfo = pointsList.querySelector('.country-info');
        pointsList.innerHTML = '';
        if (countryInfo) pointsList.appendChild(countryInfo);
        
        if (this.filteredPuntos.length === 0) {
            const noData = document.createElement('p');
            noData.textContent = 'No hi ha informació a mostrar';
            pointsList.appendChild(noData);
            document.getElementById('totalElements').textContent = `Total d'elements: 0`;
            return;
        }
        
        this.filteredPuntos.forEach(punto => {
            const pointItem = document.createElement('div');
            pointItem.className = `point-item ${punto.tipus.toLowerCase()}`;
            
            let html = `<strong>${punto.nom}</strong><br>${punto.ciutat} | Tipus: ${punto.tipus}`;
            
            if (punto.horaris) {
                html += ` | Horaris: ${punto.horaris}`;
            }
            
            if (punto.preu !== undefined) {
                html += ` | Preu: ${punto.preuIva}`;
            }
            
            if (punto.descripcio) {
                html += `<br>Descripció: ${punto.descripcio}`;
            }
            
            if (punto.puntuacio) {
                html += ` | Puntuació: ${punto.puntuacio}/5`;
            }
            
            pointItem.innerHTML = html;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'delete';
            deleteBtn.addEventListener('click', () => this.deletePoint(punto.id));
            pointItem.appendChild(deleteBtn);
            
            pointsList.appendChild(pointItem);
        });
        
        document.getElementById('totalElements').textContent = 
            `Total d'elements: ${PuntInteres.obtenirTotalElements()}`;
    }
    
    showPointsOnMap() {
        // Netejar marcadors existents
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        // Afegir marcadors nous
        this.filteredPuntos.forEach(punto => {
            if (punto.latitud && punto.longitud) {
                const lat = parseFloat(punto.latitud);
                const lon = parseFloat(punto.longitud);
                
                if (isNaN(lat) || isNaN(lon)) return;
                
                let desc = `<b>${punto.nom}</b><br>${punto.ciutat} | ${punto.tipus}`;
                
                if (punto.horaris) desc += `<br>Horaris: ${punto.horaris}`;
                if (punto.preu !== undefined) desc += `<br>Preu: ${punto.preuIva}`;
                if (punto.descripcio) desc += `<br>${punto.descripcio}`;
                if (punto.puntuacio) desc += `<br>Puntuació: ${punto.puntuacio}/5`;
                
                const marker = L.marker([lat, lon]).addTo(this.map);
                marker.bindPopup(desc);
                this.markers.push(marker);
            }
        });
    }
    
    updateTypeFilter() {
        const typeFilter = document.getElementById('typeFilter');
        
        // Conservar opcions "Tipus" i "Tots"
        typeFilter.innerHTML = '<option value="">Tipus</option><option value="Tots">Tots</option>';
        
        // Afegir tipus únics
        this.typesSet.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        });
    }
    
    deletePoint(id) {
        if (!confirm("Estàs segur que vols eliminar el punt d'interès?")) return;
        
        // Eliminar de la llista principal
        const index = this.puntosInteres.findIndex(p => p.id === id);
        if (index !== -1) {
            this.puntosInteres.splice(index, 1);
            PuntInteres.totalElements--;
        }
        
        // Eliminar de la llista filtrada
        const filteredIndex = this.filteredPuntos.findIndex(p => p.id === id);
        if (filteredIndex !== -1) {
            this.filteredPuntos.splice(filteredIndex, 1);
        }
        
        // Actualitzar UI
        this.updateUI();
    }
    
    filterByType(type) {
        if (!type || type === 'Tots') {
            this.filteredPuntos = [...this.puntosInteres];
        } else {
            this.filteredPuntos = this.puntosInteres.filter(p => 
                p.tipus.toLowerCase() === type.toLowerCase()
            );
        }
        
        this.updatePointsList();
        this.showPointsOnMap();
    }
    
    orderByName(order) {
        if (!order) return;
        
        this.filteredPuntos.sort((a, b) => {
            return order === 'asc' 
                ? a.nom.localeCompare(b.nom) 
                : b.nom.localeCompare(a.nom);
        });
        
        this.updatePointsList();
    }
    
    filterByName(name) {
        if (!name) {
            this.filteredPuntos = [...this.puntosInteres];
        } else {
            const searchTerm = name.toLowerCase();
            this.filteredPuntos = this.puntosInteres.filter(p => 
                p.nom.toLowerCase().includes(searchTerm)
            );
        }
        
        this.updatePointsList();
        this.showPointsOnMap();
    }
    
    clearList() {
        this.puntosInteres = [];
        this.filteredPuntos = [];
        PuntInteres.totalElements = 0;
        this.typesSet.clear();
        this.markers = [];
        
        // Netejar mapa
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        this.showCurrentLocation();
        
        // Netejar UI
        document.getElementById('pointsList').innerHTML = '<p>No hi ha informació a mostrar</p>';
        document.getElementById('totalElements').textContent = 'Total d\'elements: 0';
        
        // Reiniciar filtres
        document.getElementById('typeFilter').innerHTML = 
            '<option value="">Tipus</option><option value="Tots">Tots</option>';
        document.getElementById('orderFilter').value = '';
        document.getElementById('nameFilter').value = '';
    }
}

// Inicialitzar l'aplicació quan el DOM estigui carregat
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
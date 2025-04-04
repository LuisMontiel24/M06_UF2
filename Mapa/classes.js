// Constants
const IVA_PAISES = {
    'ES': 0.21,  // España
    'ESP': 0.21, // España (alternativo)
    'GB': 0.20,  // Reino Unido
    'UK': 0.20,  // Reino Unido (alternativo)
    'FR': 0.20,  // Francia
    'IT': 0.22,  // Italia
    'DE': 0.19   // Alemania
};

// Classe PuntInteres
class PuntInteres {
    static totalElements = 0;
    
    constructor(data) {
        this.id = data.id || Date.now().toString();
        this.esManual = data.esManual || false;
        this.pais = data.codi || data.pais;  // Acepta ambos campos
        this.ciutat = data.ciutat;
        this.nom = data.nom;
        this.direccio = data.direcció || data.direccio;  // Acepta ambos
        this.tipus = this.normalizeTipus(data.tipus);
        this.latitud = data.latitud;
        this.longitud = data.longitud;
        this.horaris = data.horaris || '';
        this.puntuacio = data.puntuacio || 0;
        this.descripcio = data.descripcio || data.descripció || '';
        
        PuntInteres.totalElements++;
    }
    
    normalizeTipus(tipus) {
        if (!tipus) return 'Espai';
        tipus = tipus.toString().toLowerCase().trim();
        
        if (tipus.includes('atracc') || tipus === 'atraccio') return 'Atraccio';
        if (tipus.includes('museu') || tipus === 'museum') return 'Museu';
        if (tipus.includes('espai') || tipus === 'space') return 'Espai';
        
        return 'Espai';
    }
    
    static obtenirTotalElements() {
        return this.totalElements;
    }
}

// Classe Atraccio (hereda de PuntInteres)
class Atraccio extends PuntInteres {
    constructor(data) {
        super(data);
        this.preu = this.parsePreu(data.preu);
        this.moneda = data.moneda || (['GB', 'UK'].includes(this.pais) ? '£' : '€');
    }
    
    parsePreu(preu) {
        if (typeof preu === 'string') {
            return parseFloat(preu.replace(',', '.')) || 0;
        }
        return parseFloat(preu) || 0;
    }
    
    get preuIva() {
        if (this.preu === 0) return "Entrada gratuïta";
        
        const iva = IVA_PAISES[this.pais];
        if (!iva) return `${this.preu.toFixed(2)}${this.moneda} (no IVA)`;
        
        const preuAmbIva = this.preu * (1 + iva);
        return `${preuAmbIva.toFixed(2)}${this.moneda} (IVA inclòs)`;
    }
}

// Classe Museu (hereda de PuntInteres)
class Museu extends PuntInteres {
    constructor(data) {
        super(data);
        this.preu = this.parsePreu(data.preu);
        this.moneda = data.moneda || (['GB', 'UK'].includes(this.pais) ? '£' : '€');
    }
    
    parsePreu(preu) {
        if (typeof preu === 'string') {
            return parseFloat(preu.replace(',', '.')) || 0;
        }
        return parseFloat(preu) || 0;
    }
    
    get preuIva() {
        if (this.preu === 0) return "Entrada gratuïta";
        
        const iva = IVA_PAISES[this.pais];
        if (!iva) return `${this.preu.toFixed(2)}${this.moneda} (no IVA)`;
        
        const preuAmbIva = this.preu * (1 + iva);
        return `${preuAmbIva.toFixed(2)}${this.moneda} (IVA inclòs)`;
    }
}

// Classe Excel per llegir CSV i obtenir informació del país
class Excel {
    static async readCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    const lines = content.split('\n').filter(line => line.trim() !== '');
                    
                    // Forzar delimitador punto y coma
                    const separator = ';';
                    const firstLine = lines[0];
                    
                    const headers = firstLine.split(separator)
                        .map(h => h.trim().toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
                    
                    const result = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        const currentLine = lines[i];
                        if (!currentLine.trim()) continue;
                        
                        const values = this.splitCSVLine(currentLine, separator);
                        const obj = {};
                        
                        for (let j = 0; j < headers.length; j++) {
                            if (j < values.length) {
                                let value = values[j].trim();
                                const header = headers[j];
                                
                                // Normalización de nombres de campos
                                if (header === 'direcció' || header === 'direccio') {
                                    obj['direccio'] = value;
                                } else if (header === 'codi') {
                                    obj['pais'] = value;
                                } else if (header === 'descripció') {
                                    obj['descripcio'] = value;
                                } else {
                                    obj[header] = value;
                                }
                            }
                        }
                        
                        result.push(obj);
                    }
                    
                    resolve(result);
                } catch (error) {
                    console.error("Error parsing CSV:", error);
                    reject(new Error("Error al procesar el archivo CSV. Asegúrate de que tiene el formato correcto."));
                }
            };
            
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                reject(new Error("No se pudo leer el archivo. ¿Estás seguro de que es un CSV válido?"));
            };
            
            reader.readAsText(file);
        });
    }
    
    // Método auxiliar para dividir líneas CSV respetando comillas
    static splitCSVLine(line, separator) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === separator && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
    
    static async getInfoCountry(countryCode) {
        try {
            // Normalizar códigos de país
            if (countryCode === 'ESP') countryCode = 'ES';
            if (countryCode === 'UK') countryCode = 'GB';
            
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            if (!response.ok) throw new Error('País no trobat');
            
            const data = await response.json();
            const country = data[0];
            
            return {
                city: country.capital?.[0] || 'Ciutat desconeguda',
                flag: country.flags?.png || '',
                lat: country.capitalInfo?.latlng?.[0] || 0,
                long: country.capitalInfo?.latlng?.[1] || 0
            };
        } catch (error) {
            console.error("Error obtenint informació del país:", error);
            return null;
        }
    }
}
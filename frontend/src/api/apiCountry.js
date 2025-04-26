import BaseRepository from './baseRepository';

class CountryRepository extends BaseRepository {
    constructor() {
        super('');
        this.cachedCountries = null;
    }

    async getAll() {
        if (this.cachedCountries) {
            return this.cachedCountries;
        }

        try {
            const response = await fetch('https://restcountries.com/v3.1/region/asia?fields=name,flags,cca2');
            const data = await response.json();
            let countries = data.map(country => ({
                code: country.cca2,
                name: country.name.common,
                flag: country.flags.svg
            }));

            const vietnam = countries.find(c => c.code === 'VN');
            if (vietnam) {
                countries = [
                    vietnam,
                    ...countries.filter(c => c.code !== 'VN')
                ];
            }

            const sortedCountries = countries.sort((a, b) => {
                if (a.code === 'VN') return -1;
                if (b.code === 'VN') return 1;
                return a.name.localeCompare(b.name);
            });

            this.cachedCountries = sortedCountries;
            return sortedCountries;
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw new Error('Failed to fetch countries');
        }
    }
}

export default new CountryRepository();

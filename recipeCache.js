// Recipe data caching utility
// This module provides efficient caching of recipes.json using sessionStorage

const RecipeCache = (() => {
    const CACHE_KEY = 'bakery_recipes_cache';
    const VERSION_KEY = 'bakery_recipes_version';
    const CURRENT_VERSION = '1.0'; // Increment this when recipes.json structure changes

    /**
     * Fetches recipes data, using cache when available
     * @returns {Promise<Array>} Array of recipe objects
     */
    async function getRecipes() {
        try {
            // Check if we have cached data with matching version
            const cachedVersion = sessionStorage.getItem(VERSION_KEY);
            const cachedData = sessionStorage.getItem(CACHE_KEY);

            if (cachedVersion === CURRENT_VERSION && cachedData) {
                // Return cached data
                const parsed = JSON.parse(cachedData);
                console.log('Using cached recipe data');
                return parsed.recipes;
            }

            // Cache miss or version mismatch - fetch from server
            console.log('Fetching recipe data from server');
            const response = await fetch('recipes.json');

            if (!response.ok) {
                throw new Error('Failed to load recipes');
            }

            const data = await response.json();

            // Store in cache
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
            sessionStorage.setItem(VERSION_KEY, CURRENT_VERSION);

            return data.recipes;

        } catch (error) {
            console.error('Error loading recipes:', error);
            // Try to return cached data even if version doesn't match
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                console.log('Using stale cache due to fetch error');
                const parsed = JSON.parse(cachedData);
                return parsed.recipes;
            }
            throw error;
        }
    }

    /**
     * Clears the recipe cache
     * Useful for debugging or forcing a refresh
     */
    function clearCache() {
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(VERSION_KEY);
        console.log('Recipe cache cleared');
    }

    /**
     * Gets cache statistics
     * @returns {Object} Cache info including size and version
     */
    function getCacheInfo() {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        const version = sessionStorage.getItem(VERSION_KEY);

        return {
            isCached: !!cachedData,
            version: version,
            currentVersion: CURRENT_VERSION,
            sizeKB: cachedData ? (new Blob([cachedData]).size / 1024).toFixed(2) : 0
        };
    }

    // Public API
    return {
        getRecipes,
        clearCache,
        getCacheInfo
    };
})();

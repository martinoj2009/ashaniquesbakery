// DOM elements
const elements = {
    loading: null,
    error: null,
    errorMessage: null,
    container: null,
    image: null,
    title: null,
    badges: null,
    description: null,
    infoGrid: null,
    ingredients: null,
    instructions: null,
    tipsSection: null,
    tips: null,
};

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    elements.loading = document.getElementById('recipe-loading');
    elements.error = document.getElementById('recipe-error');
    elements.errorMessage = document.getElementById('error-message');
    elements.container = document.getElementById('recipe-container');
    elements.image = document.getElementById('recipe-image');
    elements.title = document.getElementById('recipe-title');
    elements.badges = document.getElementById('recipe-badges');
    elements.description = document.getElementById('recipe-description');
    elements.infoGrid = document.getElementById('recipe-info-grid');
    elements.ingredients = document.getElementById('recipe-ingredients');
    elements.instructions = document.getElementById('recipe-instructions');
    elements.tipsSection = document.getElementById('recipe-tips-section');
    elements.tips = document.getElementById('recipe-tips');

    // Get recipe ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('id'));

    if (!recipeId) {
        showError('No recipe specified.');
        return;
    }

    try {
        // Get recipes data from cache
        const recipes = await RecipeCache.getRecipes();
        const recipe = recipes.find(r => r.id === recipeId);

        if (!recipe) {
            showError('Recipe not found.');
            return;
        }

        // Display the recipe
        displayRecipe(recipe);

        // Update page title
        document.title = `${recipe.name} - Ashanique's Bakery`;

    } catch (error) {
        console.error('Error loading recipe:', error);
        showError('Failed to load recipe. Please try again later.');
    }
});

// Display recipe details
function displayRecipe(recipe) {
    // Hide loading, show container
    elements.loading.hidden = true;
    elements.container.hidden = false;

    // Set image
    elements.image.src = escapeHtml(recipe.image);
    elements.image.alt = escapeHtml(recipe.name);

    // Set title
    elements.title.textContent = recipe.name;

    // Set badges
    elements.badges.innerHTML = `
        <span class="badge ${recipe.difficulty.toLowerCase()}">${escapeHtml(recipe.difficulty)}</span>
        <span class="badge category">${escapeHtml(recipe.category)}</span>
    `;

    // Set description
    elements.description.textContent = recipe.description;

    // Set info grid
    elements.infoGrid.innerHTML = `
        <div class="recipe-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm-.5 2v5l3.5 2 .5-1-3-1.75V5h-1z"/>
            </svg>
            <div>
                <strong>Prep Time</strong>
                <span>${escapeHtml(recipe.prepTime)}</span>
            </div>
        </div>
        <div class="recipe-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 2v16h12V2H4zm1 1h10v14H5V3zm2 2v2h6V5H7zm0 3v2h6V8H7zm0 3v2h6v-2H7z"/>
            </svg>
            <div>
                <strong>Cook Time</strong>
                <span>${escapeHtml(recipe.cookTime)}</span>
            </div>
        </div>
        <div class="recipe-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm-.5 2v5.5l4 2 .5-1-3.5-1.75V5h-1z"/>
            </svg>
            <div>
                <strong>Total Time</strong>
                <span>${escapeHtml(recipe.totalTime)}</span>
            </div>
        </div>
        <div class="recipe-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-3 0v-6A1.5 1.5 0 0 1 10 5zM5 6a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1zm10 0a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1zM3 14h14v3H3v-3z"/>
            </svg>
            <div>
                <strong>Servings</strong>
                <span>${escapeHtml(recipe.servings)}</span>
            </div>
        </div>
    `;

    // Generate ingredients sections HTML
    const ingredientsSectionsHtml = recipe.sections.map(section => `
        <div class="recipe-section-group">
            ${recipe.sections.length > 1 ? `<h4 class="section-name">${escapeHtml(section.name)}</h4>` : ''}
            <ul class="ingredients-list">
                ${section.ingredients.map(ingredient => `
                    <li>${decimalToFraction(ingredient.value)} ${escapeHtml(ingredient.measurement)} ${escapeHtml(ingredient.name)}</li>
                `).join('')}
            </ul>
        </div>
    `).join('');
    elements.ingredients.innerHTML = ingredientsSectionsHtml;

    // Generate instructions sections HTML
    const instructionsSectionsHtml = recipe.sections.map(section => `
        <div class="recipe-section-group">
            ${recipe.sections.length > 1 ? `<h4 class="section-name">${escapeHtml(section.name)}</h4>` : ''}
            <ol class="instructions-list">
                ${section.instructions.map(instruction => `
                    <li>${escapeHtml(instruction)}</li>
                `).join('')}
            </ol>
        </div>
    `).join('');
    elements.instructions.innerHTML = instructionsSectionsHtml;

    // Show tips if available
    if (recipe.tips && recipe.tips.length > 0) {
        elements.tipsSection.hidden = false;
        elements.tips.innerHTML = recipe.tips.map(tip => `
            <li>${escapeHtml(tip)}</li>
        `).join('');
    }
}

// Show error message
function showError(message) {
    elements.loading.hidden = true;
    elements.error.hidden = false;
    elements.errorMessage.textContent = message;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Convert decimal to fraction string for display
function decimalToFraction(decimal) {
    // Handle whole numbers
    if (decimal % 1 === 0) {
        return decimal.toString();
    }

    const tolerance = 1.0e-6;
    const whole = Math.floor(decimal);
    const fractional = decimal - whole;

    // Common denominators for baking (prioritize simple fractions)
    const commonDenominators = [2, 3, 4, 8, 16];

    for (let denominator of commonDenominators) {
        const numerator = Math.round(fractional * denominator);
        const calculatedValue = numerator / denominator;

        // Check if this fraction is close enough to the original value
        if (Math.abs(calculatedValue - fractional) < tolerance) {
            // Simplify the fraction
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(numerator, denominator);
            const simplifiedNum = numerator / divisor;
            const simplifiedDen = denominator / divisor;

            if (simplifiedNum === 0) {
                return whole.toString();
            }

            const fractionStr = `${simplifiedNum}/${simplifiedDen}`;
            return whole > 0 ? `${whole} ${fractionStr}` : fractionStr;
        }
    }

    // Fallback: return decimal rounded to 2 places
    return decimal.toFixed(2).replace(/\.?0+$/, '');
}

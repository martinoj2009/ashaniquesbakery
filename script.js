const { 
    AppBar, Toolbar, Button, Card, CardContent, CardMedia, Dialog,
    DialogTitle, DialogContent, DialogActions, Select, MenuItem, 
    Typography, TextField, Box, IconButton
} = MaterialUI;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("data.json");
        const data = await response.json();
        renderAppBar();
        renderControls();
        renderProducts(data.products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
});

function renderAppBar() {
    const appBar = document.getElementById('app-bar');
    const appBarComponent = document.createElement('div');
    ReactDOM.render(
        <AppBar position="static" style={{ backgroundColor: '#f8b400' }}>
            <Toolbar>
                <Typography variant="h4" component="h1" style={{ flexGrow: 1, textAlign: 'center' }}>
                    Ashanique's Bakery
                </Typography>
            </Toolbar>
        </AppBar>,
        appBarComponent
    );
    appBar.appendChild(appBarComponent);
}

function renderControls() {
    const controls = document.getElementById('controls');
    const controlsComponent = document.createElement('div');
    ReactDOM.render(
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
            <TextField
                fullWidth
                placeholder="Search products..."
                variant="outlined"
                sx={{ marginBottom: 2 }}
            />
            <Select
                defaultValue="name-asc"
                sx={{ width: 200 }}
            >
                <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                <MenuItem value="price-asc">Price (Low to High)</MenuItem>
                <MenuItem value="price-desc">Price (High to Low)</MenuItem>
            </Select>
        </Box>,
        controlsComponent
    );
    controls.appendChild(controlsComponent);
}

function renderProducts(products) {
    const productList = document.getElementById('product-list');
    const productsComponent = document.createElement('div');
    ReactDOM.render(
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, p: 2 }}>
            {products.map(product => (
                <Card 
                    key={product.id}
                    onClick={() => openProductModal(product)}
                    sx={{ cursor: 'pointer' }}
                >
                    <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={product.name}
                    />
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{product.name}</Typography>
                        <Typography variant="subtitle1" sx={{ color: '#f8b400', fontWeight: 'bold' }}>
                            From {product.variations[0].price}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>,
        productsComponent
    );
    productList.appendChild(productsComponent);
}

function openProductModal(product) {
    const modalContainer = document.createElement('div');
    ReactDOM.render(
        <Dialog 
            open={true}
            onClose={() => modalContainer.remove()}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {product.name}
                    <IconButton onClick={() => modalContainer.remove()}>
                        <span className="material-icons">close</span>
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{ borderRadius: 1, mb: 2 }}
                />
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.description}
                </Typography>
                <Select
                    fullWidth
                    defaultValue={product.variations[0].orderLink}
                    sx={{ mb: 2 }}
                >
                    {product.variations.map(v => (
                        <MenuItem key={v.sku} value={v.orderLink}>
                            {v.name} - {v.price}
                        </MenuItem>
                    ))}
                </Select>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Note: This is a $10 deposit. The full price will be invoiced.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    href={product.variations[0].orderLink}
                    sx={{ backgroundColor: '#f8b400', '&:hover': { backgroundColor: '#d59c00' } }}
                >
                    Pay Deposit
                </Button>
            </DialogActions>
        </Dialog>,
        modalContainer
    );
    document.body.appendChild(modalContainer);
}
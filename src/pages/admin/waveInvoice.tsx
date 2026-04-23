import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Box,
  Divider,
  MenuItem,
  Stepper,
  StepLabel,
  Step,
  Stack,
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableBody,
  Snackbar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../admin/AdminNavbar";

interface Product {
  id: string;
  name: string;
  description?: string;
  unitPrice?: number;
}

export default function AdminCreateInvoice() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<any>({});

  const validateClient = () => {
  let newErrors: any = {};

  if (!form.name.trim()) {
    newErrors.name = "Client name is required";
  }

  if (!form.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    newErrors.email = "Invalid email format";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const validateItems = () => {
  let newErrors: any = {};

  if (!form.items.length) {
    newErrors.items = "At least one product is required";
  } else {
    const itemErrors = form.items.map((item) => {
      let err: any = {};

      if (!item.myproductId) {
        err.myproductId = "Select a product";
      }

      if (item.quantity <= 0) {
        err.quantity = "Qty must be ≥ 1";
      }

      if (item.price < 0) {
        err.price = "Price cannot be negative";
      }

      return err;
    });

    newErrors.items = itemErrors;
  }

  setErrors(newErrors);

  return !newErrors.items?.some((e) => Object.keys(e).length > 0);
};

  const [form, setForm] = useState({
    name: "",
    email: "",
    items: [
      { myproductId: "", description: "", quantity: 1, price: 0 }
    ]
  });
  

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [step, setStep] = useState(0);

  // Load Products from Backend
  useEffect(() => {
    fetch("/api/invoice-products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products", err));
  }, []);

  
  // Form handlers

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: number) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;

    setForm({ ...form, items: updatedItems });
  };

  
  // handle product selection from dropdown
  const handleProductSelect = (index: number, myproductId: string) => {
    const product = products.find(p => p.id === myproductId);

    const updatedItems = [...form.items];
    updatedItems[index] = {
      myproductId: product.id,
      description: product.description || product.name,
      quantity: 1,
      price: Number(product.unitPrice || 0)
    };

    setForm({ ...form, items: updatedItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { myproductId: "", description: "", quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
  if (form.items.length === 1) return; // prevent empty list
  const updatedItems = form.items.filter((_, i) => i !== index);
  setForm({ ...form, items: updatedItems });
};

  // Total calculation 
  const total = form.items.reduce((sum, item) => {
    return sum + item.quantity * item.price;
  }, 0);

  // handle form submission 
  const handleSubmit = async (e) => {
  e.preventDefault();

  const isClientValid = validateClient();
  const isItemsValid = validateItems();

  if (!isClientValid || !isItemsValid) {
    setStep(0); 
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        amount: total
      })
    });

    const data = await res.json();
    setResult(data);
    setOpenSnackbar(true);

  } catch (err) {
    console.error(err);
    alert("Invoice creation failed");
  }

  setLoading(false);
};

  return (
      <>
  <Navbar />

  <Container maxWidth="md" sx={{ mt: 6 }}>
    <Card elevation={4}>
      <CardContent>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create Invoice
        </Typography>

        {/* stepper */}
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          <Step><StepLabel>Client</StepLabel></Step>
          <Step><StepLabel>Items</StepLabel></Step>
          <Step><StepLabel>Review</StepLabel></Step>
        </Stepper>

        {/* Client */}
        {step === 0 && (
          <Stack spacing={2}>
            <TextField
              label="Client Name"
              value={form.name}
              onChange={handleChange}
              name="name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Client Email"
              value={form.email}
              onChange={handleChange}
              name="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
            />

            <Button
              variant="contained"
              onClick={() => {
              if (validateClient()) setStep(1);
            }}>
              Next
            </Button>
          </Stack>
        )}

        {/* Table items */}
        {step === 1 && (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {form.items.map((item, index) => (
                  <TableRow key={index}>

                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={item.myproductId}
                        error={!!errors.items?.[index]?.myproductId}
                        helperText={errors.items?.[index]?.myproductId}
                        onChange={(e) =>
                          handleProductSelect(index, e.target.value)
                        }
                      >
                        {products.map(p => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        error={!!errors.items?.[index]?.quantity}
                        helperText={errors.items?.[index]?.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", Number(e.target.value))
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        type="number"
                        value={item.price}
                        error={!!errors.items?.[index]?.price}
                        helperText={errors.items?.[index]?.price}
                        onChange={(e) =>
                          handleItemChange(index, "price", Number(e.target.value))
                        }
                      />
                    </TableCell>

                    <TableCell>
                      ${item.quantity * item.price}
                    </TableCell>

                    <TableCell>
                      <IconButton onClick={() => removeItem(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }}>
              Add Item
            </Button>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button
                variant="contained" onClick={() => { if (validateItems()) setStep(2);}}>
                Next
              </Button>
            </Box>
          </>
        )}

        {/* Review */}
        {step === 2 && (
          <Stack spacing={2}>
            <Typography>Name: {form.name}</Typography>
            <Typography>Email: {form.email}</Typography>

            {form.items.map((item, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: "space-between" }}>
                <span>{item.description} {item.quantity} x {item.price}</span>
                <span>${item.quantity * item.price}</span>
              </Box>
            ))}

            <Typography fontWeight="bold">
              Total: ${total.toFixed(2)}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : "Create Invoice"}
              </Button>
            </Box>
              {/* successful invoice creation alert */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
                Invoice created successfully!
              </Alert>
            </Snackbar>
          </Stack>
        )}
      </CardContent>
    </Card>
  </Container>
</>
  );
}
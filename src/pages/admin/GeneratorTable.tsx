import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  Backdrop,
  Button,
  CircularProgress,
  Fab,
  Paper,
  Stack,
  Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import noImage from "../../assets/logo.png";


interface GeneratorRow {
  id: string;
  Serial_Number: string;
  name: string;
  description: string;
  stock: number;
  image: string;
  imageKey: string;
  image2: string;
  imageKey2: string;
  image3: string;
  imageKey3: string;
  image4: string;
  imageKey4: string;
  image5: string;
  imageKey5: string;
}
type PictureSlotEditorProps = {
  title: string;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  file: File | null;
};

const PictureSlotEditor: React.FC<PictureSlotEditorProps> = ({
  title,
  url,
  setUrl,
  setFile,
  file,
}) => {
  return (
    <Stack
      spacing={1}
      sx={{
        border: "1px solid #ddd",
        borderRadius: 2,
        p: 2,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography fontWeight="bold">{title}</Typography>

      <TextField
        fullWidth
        label="Paste image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <Button variant="outlined" component="label">
        Upload Image
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </Button>

      {file && (
        <Typography variant="body2" sx={{ color: "green" }}>
          Selected file: {file.name}
        </Typography>
      )}

      <Button
        color="error"
        onClick={() => {
          setUrl("");
          setFile(null);
        }}
      >
        Clear Slot
      </Button>
    </Stack>
  );
};


function GeneratorTable() {

  const [openPictureDialog, setOpenPictureDialog] = useState(false);
  const [editingRow, setEditingRow] = useState<GeneratorRow | null>(null);

  const [manualImage1, setManualImage1] = useState("");
  const [manualImage2, setManualImage2] = useState("");
  const [manualImage3, setManualImage3] = useState("");
  const [manualImage4, setManualImage4] = useState("");
  const [manualImage5, setManualImage5] = useState("");


  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [file4, setFile4] = useState<File | null>(null);
  const [file5, setFile5] = useState<File | null>(null);

  const [rows, setRows] = useState<GeneratorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
  type: "include",
  ids: new Set(),
});

const openPictureEditor = (row: GeneratorRow) => {
  setEditingRow(row);

  setManualImage1(row.image || "");
  setManualImage2(row.image2 || "");
  setManualImage3(row.image3 || "");
  setManualImage4(row.image4 || "");
  setManualImage5(row.image5 || "");


  setFile1(null);
  setFile2(null);
  setFile3(null);
  setFile4(null);
  setFile5(null);

  setOpenPictureDialog(true);
};

const uploadImageIfNeeded = async (
  file: File | null,
  manualUrl: string,
  oldUrl: string,
  oldKey: string
): Promise<{ imageUrl: string; imageKey: string }> => {
  if (file) {
    const formData = new FormData();
    formData.append("image", file);

    const uploadResponse = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadResult.message || "Image upload failed.");
    }

    return {
      imageUrl: uploadResult.imageUrl || "",
      imageKey: uploadResult.key || "",
    };
  }

  const trimmedManualUrl = manualUrl.trim();
  const trimmedOldUrl = (oldUrl || "").trim();

  if (!trimmedManualUrl) {
    return {
      imageUrl: "",
      imageKey: "",
    };
  }

  // unchanged existing image -> keep old key
  if (trimmedManualUrl === trimmedOldUrl) {
    return {
      imageUrl: oldUrl || "",
      imageKey: oldKey || "",
    };
  }

  // changed to a pasted URL -> no s3 key
  return {
    imageUrl: trimmedManualUrl,
    imageKey: "",
  };
};

const handleSavePictures = async () => {
  if (!editingRow) return;

  try {
    const slot1 = await uploadImageIfNeeded(file1, manualImage1, editingRow.image, editingRow.imageKey);
    const slot2 = await uploadImageIfNeeded(file2, manualImage2, editingRow.image2, editingRow.imageKey2);
    const slot3 = await uploadImageIfNeeded(file3, manualImage3, editingRow.image3, editingRow.imageKey3);
    const slot4 = await uploadImageIfNeeded(file4, manualImage4, editingRow.image4, editingRow.imageKey4);
    const slot5 = await uploadImageIfNeeded(file5, manualImage5, editingRow.image5, editingRow.imageKey5);
    const res = await fetch(`http://localhost:3000/api/generators/${editingRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Serial_Number: editingRow.Serial_Number,
        Description: editingRow.description,
        name: editingRow.name,
        Stock: editingRow.stock,

        Image_Url: slot1.imageUrl,
        Image_Key: slot1.imageKey,

        Image_Url2: slot2.imageUrl,
        Image_Key2: slot2.imageKey,

        Image_Url3: slot3.imageUrl,
        Image_Key3: slot3.imageKey,

        Image_Url4: slot4.imageUrl,
        Image_Key4: slot4.imageKey,

        Image_Url5: slot5.imageUrl,
        Image_Key5: slot5.imageKey,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to update generator pictures");
    }

    const updatedGen = await res.json();

    setRows((prev) =>
      prev.map((row) =>
        row.id === editingRow.id
          ? {
              ...row,
              image: updatedGen.Image_Url ?? "",
              imageKey: updatedGen.Image_Key ?? "",
              image2: updatedGen.Image_Url2 ?? "",
              imageKey2: updatedGen.Image_Key2 ?? "",
              image3: updatedGen.Image_Url3 ?? "",
              imageKey3: updatedGen.Image_Key3 ?? "",
              image4: updatedGen.Image_Url4 ?? "",
              imageKey4: updatedGen.Image_Key4 ?? "",
              image5: updatedGen.Image_Url5 ?? "",
              imageKey5: updatedGen.Image_Key5 ?? "",
            }
          : row
      )
    );

    setOpenPictureDialog(false);
    setEditingRow(null);
  } catch (err) {
    console.error("Picture update error:", err);
  }
};

const getSelectedIds = (): string[] => {
  return Array.from(rowSelectionModel.ids).map(String);
};

const selectedIds = getSelectedIds();

const handleCloseDelete = () => {
  setOpenDelete(false); // Closes the delete confirmation
};
  const navigate = useNavigate();

  const getGens = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/generators");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const formattedRows: GeneratorRow[] = data.map((gen: any) => ({
        id: gen._id ?? gen.genID,
        Serial_Number: gen.Serial_Number ?? "",
        name: gen.name ?? "",
        description: gen.Description ?? "",
        stock: Number(gen.Stock) || 0,
        image: gen.Image_Url ?? "",
        imageKey: gen.Image_Key ?? "",
        image2: gen.Image_Url2 ?? "",
        imageKey2: gen.Image_Key2 ?? "",
        image3: gen.Image_Url3 ?? "",
        imageKey3: gen.Image_Key3 ?? "",
        image4: gen.Image_Url4 ?? "",
        imageKey4: gen.Image_Key4 ?? "",
        image5: gen.Image_Url5 ?? "",
        imageKey5: gen.Image_Key5 ?? "",
      }));

      setRows(formattedRows);
    } catch (err) {
      console.error("Error fetching generators:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGens();
  }, []);

  const processRowUpdate = async (newRow: GeneratorRow) => {
  // prevent negatives
  const updatedRow = {
    ...newRow,
    stock: Math.max(0, Number(newRow.stock)),
    Serial_Number: newRow.Serial_Number,
    description: newRow.description,
    name: newRow.name,
    image: newRow.image,
    image2: newRow.image2,
    image3: newRow.image3,
    image4: newRow.image4,
    image5: newRow.image5,
  };

  // optimistic UI update
  setRows((prev) =>
    prev.map((row) =>
      row.id === updatedRow.id ? updatedRow : row
    )
  );

  // save to DB
  await saveStock(updatedRow.id, updatedRow.Serial_Number, updatedRow.description, updatedRow.name, updatedRow.stock, updatedRow.image, updatedRow.image2, updatedRow.image3 );

  return updatedRow;
};

const saveStock = async (id: string, Serial_Number: string, description: string, name: string, stock: number, image: string, image2: string, image3: string) => {
  try {
    const res = await fetch(`http://localhost:3000/api/generators/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Stock: stock, Image_Url: image,Image_Url2: image2, Image_Url3: image3, Serial_Number: Serial_Number, Description: description, name: name}) 
    });

    if (!res.ok) throw new Error("Failed to update generator");

    const updatedGen = await res.json();

    // Sync UI with DB response
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, 
            stock: Number(updatedGen.Stock),
            image: updatedGen.Image_Url,
            image2: updatedGen.Image_Url2,
            image3: updatedGen.Image_Url3,
            image4: updatedGen.Image_Url4,
            image5: updatedGen.Image_Url5,
            Serial_Number: updatedGen.Serial_Number,
            description: updatedGen.Description,
            name: updatedGen.name
          }
          : row
      )
    );
  } catch (err) {
    console.error("Stock update error:", err);
  }
};



  const columns: GridColDef[] = [
    { field: "Serial_Number", headerName: "Serial Number", width: 150, editable: true  },
    { field: "name", headerName: "Name", width: 150, editable: true },
    { field: "description", 
      headerName: "Description", 
      width: 200, 
      editable: true, 
      renderCell: (params) => {
        const fullText = params.value || "";
        const shortText =
          fullText.length > 40 ? `${fullText.slice(0, 120)}...` : fullText;

        return (
          <span title={fullText}>
            {shortText}
          </span>
        );
      },
    },
    { field: "stock", headerName: "Stock", width:100, editable: true,type: "number",},
    { field: "editPictures",
      headerName: "Pictures",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => openPictureEditor(params.row)}
        >
          Edit Pictures
        </Button>
      ),
    },
    // images
    { field: "image",
    headerName: "Image",
    width: 150,
    editable: false,
    type: "string",
    headerAlign: "left",
    align: "left",
    display: "flex",
    renderCell: (params) => {
      return (
        <Stack direction="row">
          <Box
            component="img"
            sx={{
              height: 70,
              width: 70,
              objectFit: "cover",
            }}
            alt="No Image available"
            src={params.value || ""}
            onError={(e) => {
               (e.currentTarget as HTMLImageElement).src = noImage;
            }}
          />
        </Stack>
      );
    },
  },
    { field: "image2",
    headerName: "Image2",
    width: 150,
    editable: false,
    type: "string",
    headerAlign: "left",
    align: "left",
    display: "flex",
    renderCell: (params) => {
      return (
        <Stack direction="row">
          <Box
            component="img"
            sx={{
              height: 70,
              width: 70,
              objectFit: "cover",
            }}
            alt="No Image available"
            src={params.value || ""}
            onError={(e) => {
               (e.currentTarget as HTMLImageElement).src = noImage;
            }}
          />
        </Stack>
      );
    },
  },
    { field: "image3",
    headerName: "Image3",
    width: 150,
    editable: false,
    type: "string",
    headerAlign: "left",
    align: "left",
    display: "flex",
    renderCell: (params) => {
      return (
        <Stack direction="row">
          <Box
            component="img"
            sx={{
              height: 70,
              width: 70,
              objectFit: "cover",
            }}
            alt="No Image available"
            src={params.value || ""}
            onError={(e) => {
               (e.currentTarget as HTMLImageElement).src = noImage;
            }}
          />
        </Stack>
      );
    },
  },

  { field: "image4",
    headerName: "Image4",
    width: 150,
    editable: false,
    type: "string",
    headerAlign: "left",
    align: "left",
    display: "flex",
    renderCell: (params) => {
      return (
        <Stack direction="row">
          <Box
            component="img"
            sx={{
              height: 70,
              width: 70,
              objectFit: "cover",
            }}
            alt="No Image available"
            src={params.value || ""}
            onError={(e) => {
               (e.currentTarget as HTMLImageElement).src = noImage;
            }}
          />
        </Stack>
      );
    },
  },
  { field: "image5",
    headerName: "Image5",
    width: 110,
    editable: false,
    type: "string",
    headerAlign: "left",
    align: "left",
    display: "flex",
    renderCell: (params) => {
      return (
        <Stack direction="row">
          <Box
            component="img"
            sx={{
              height: 70,
              width: 70,
              objectFit: "cover",
            }}
            alt="No Image available"
            src={params.value || ""}
            onError={(e) => {
               (e.currentTarget as HTMLImageElement).src = noImage;
            }}
          />
        </Stack>
      );
    },
  },
 ];

const handleDeleteRows = async () => {
  const ids = getSelectedIds();
  if (ids.length === 0) return;

  try {
    await Promise.all(
      ids.map(async (genId) => {
        const res = await fetch(
          `http://localhost:3000/api/generators/${genId}`,
          { method: "DELETE" }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message);
        }
      })
    );

    // optimistic UI update
    setRows((prev) => prev.filter((row) => !ids.includes(row.id)));

    setRowSelectionModel({
      type: "include",
      ids: new Set(),
    });
    handleCloseDelete();
  } catch (err) {
    console.error("Delete error:", err);
  }
};

  return (
    <>
      <Box sx={{ height: '70vh', width: '80vw' }}>
        {loading ? (
          <Stack sx={{ height: "100%" }} justifyContent="center" alignItems="center">
            <CircularProgress />
          </Stack>
        ) : (
          <DataGrid
            // removed check all since it bugs with the delete function
            sx={{
              "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer": {
                display: "none"
              }
            }}
            rows={rows}
            columns={columns}
            getRowHeight={() => 'auto'}
            disableColumnResize={false} 
            hideFooterPagination={true}
            checkboxSelection            
            disableRowSelectionOnClick
            processRowUpdate={processRowUpdate}
            onRowSelectionModelChange={(newSelection) => {
              setRowSelectionModel(newSelection);
            }}
          />
        )}
      </Box>
      <Dialog open={openPictureDialog} onClose={() => setOpenPictureDialog(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Edit Generator Pictures</DialogTitle>

  <DialogContent>
    <Stack spacing={3} mt={1}>
      <PictureSlotEditor
        title="Image Slot 1"
        url={manualImage1}
        setUrl={setManualImage1}
        setFile={setFile1}
        file={file1}
      />

      <PictureSlotEditor
        title="Image Slot 2"
        url={manualImage2}
        setUrl={setManualImage2}
        setFile={setFile2}
        file={file2}
      />

      <PictureSlotEditor
        title="Image Slot 3"
        url={manualImage3}
        setUrl={setManualImage3}
        setFile={setFile3}
        file={file3}
      />
      
      <PictureSlotEditor
        title="Image Slot 4"
        url={manualImage4}
        setUrl={setManualImage4}
        setFile={setFile4}
        file={file4}
      />
      
      <PictureSlotEditor
        title="Image Slot 5"
        url={manualImage5}
        setUrl={setManualImage5}
        setFile={setFile5}
        file={file5}
      />
    </Stack>
  </DialogContent>

  

  <DialogActions>
    <Button onClick={() => setOpenPictureDialog(false)}>Cancel</Button>
    <Button variant="contained" onClick={handleSavePictures}>
      Save Pictures
    </Button>
  </DialogActions>
</Dialog>

      {/* Delete Confirmation */}
      <Backdrop open={openDelete} sx={{ color: "#fff", zIndex: 1300 }}>
        <Paper sx={{ width: 400, p: 4 }}>
          <Typography align="center" sx = {{ fontWeight:"bold", fontSize: 'h6.fontSize' }}>
            Delete {selectedIds.length} generators?
          </Typography>
          <Stack direction="row" spacing={4} mt={3} justifyContent="center">
            <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteRows}>Confirm</Button>
          </Stack>
        </Paper>
      </Backdrop>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ position: "fixed", top: 32, right: 32 }}>
        <Fab color="primary" onClick={() => navigate("/admin/create-gen")}>
          <AddIcon />
        </Fab>
        <Fab
          color="secondary"
          disabled={selectedIds.length === 0}
          onClick={() => setOpenDelete(true)}
        >
          <DeleteIcon />
        </Fab>
      </Stack>
    </>
  );
}
export default GeneratorTable;
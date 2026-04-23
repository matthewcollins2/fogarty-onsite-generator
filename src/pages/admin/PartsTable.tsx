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
Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import noImage from "../../assets/logo.png";


interface PartRow {
  id: string;
  Part_Name: string;
  stock: number;
  description: string;
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

// displays parts table for the inventory-management page
function PartsTable() {

  const [openPictureDialog, setOpenPictureDialog] = useState(false);
  const [editingRow, setEditingRow] = useState<PartRow | null>(null);

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

  const [rows, setRows] = useState<PartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
  type: "include",
  ids: new Set(),
});

const openPictureEditor = (row: PartRow) => {
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
    const res = await fetch(`http://localhost:3000/api/parts/${editingRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Part_Name: editingRow.Part_Name,
        Stock: editingRow.stock,
        Description: editingRow.description,

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
      throw new Error("Failed to update part pictures");
    }

    const updatedPart = await res.json();

    setRows((prev) =>
      prev.map((row) =>
        row.id === editingRow.id
          ? {
              ...row,
              image: updatedPart.Image_Url ?? "",
              imageKey: updatedPart.Image_Key ?? "",
              image2: updatedPart.Image_Url2 ?? "",
              imageKey2: updatedPart.Image_Key2 ?? "",
              image3: updatedPart.Image_Url3 ?? "",
              imageKey3: updatedPart.Image_Key3 ?? "",
              image4: updatedPart.Image_Url4 ?? "",
              imageKey4: updatedPart.Image_Key4 ?? "",
              image5: updatedPart.Image_Url5 ?? "",
              imageKey5: updatedPart.Image_Key5 ?? "",
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

  const getParts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/parts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const formattedRows: PartRow[] = data.map((part: any) => ({
        id: part._id ?? part.partID,
        Part_Name: part.Part_Name ?? "",
        description: part.Description ?? "",
        stock: Number(part.Stock) || 0,
        image: part.Image_Url ?? "",
        imageKey: part.Image_Key ?? "",
        image2: part.Image_Url2 ?? "",
        imageKey2: part.Image_Key2 ?? "",
        image3: part.Image_Url3 ?? "",
        imageKey3: part.Image_Key3 ?? "",
        image4: part.Image_Url4 ?? "",
        imageKey4: part.Image_Key4 ?? "",
        image5: part.Image_Url5 ?? "",
        imageKey5: part.Image_Key5 ?? "",
      }));

      setRows(formattedRows);
    } catch (err) {
      console.error("Error fetching parts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getParts();
  }, []);

  const processRowUpdate = async (newRow: PartRow) => {
    const updatedRow = {
    ...newRow,
    stock: Math.max(0, Number(newRow.stock)),
    description: newRow.description,
    Part_Name: newRow.Part_Name,
    image: newRow.image,
    imageKey: newRow.imageKey,
    image2: newRow.image2,
    imageKey2: newRow.imageKey2,
    image3: newRow.image3,
    imageKey3: newRow.imageKey3,
    image4: newRow.image4,
    imageKey4: newRow.imageKey4,
    image5: newRow.image5,
    imageKey5: newRow.imageKey5,
  };

  setRows((prev) =>
    prev.map((row) => (row.id === updatedRow.id ? updatedRow : row))
  );
 
    await savePart(
      updatedRow.id,
      updatedRow.Part_Name,
      updatedRow.stock,
      updatedRow.description,
      updatedRow.image,
      updatedRow.imageKey,
      updatedRow.image2,
      updatedRow.imageKey2,
      updatedRow.image3,
      updatedRow.imageKey3,
      updatedRow.image4,
      updatedRow.imageKey4,
      updatedRow.image5,
      updatedRow.imageKey5
    );

    return updatedRow;
  };
  
  const savePart = async (
  id: string,
  Part_Name: string,
  stock: number,
  description: string,
  image: string,
  imageKey: string,
  image2: string,
  imageKey2: string,
  image3: string,
  imageKey3: string,
  image4: string,
  imageKey4: string,
  image5: string,
  imageKey5: string

) => {
  try {
    const res = await fetch(`http://localhost:3000/api/parts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Part_Name,
        Stock: stock,
        Description: description,
        Image_Url: image,
        Image_Key: imageKey,
        Image_Url2: image2,
        Image_Key2: imageKey2,
        Image_Url3: image3,
        Image_Key3: imageKey3,
        Image_Url4: image4,
        Image_Key4: imageKey4,
        Image_Url5: image5,
        Image_Key5: imageKey5,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message);
    }

    const updatedPart = await res.json();

    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              Part_Name: updatedPart.Part_Name ?? "",
              stock: Number(updatedPart.Stock) || 0,
              description: updatedPart.Description ?? "",
              image: updatedPart.Image_Url ?? "",
              imageKey: updatedPart.Image_Key ?? "",
              image2: updatedPart.Image_Url2 ?? "",
              imageKey2: updatedPart.Image_Key2 ?? "",
              image3: updatedPart.Image_Url3 ?? "",
              imageKey3: updatedPart.Image_Key3 ?? "",
              image4: updatedPart.Image_Url4 ?? "",
              imageKey4: updatedPart.Image_Key4 ?? "",
              image5: updatedPart.Image_Url5 ?? "",
              imageKey5: updatedPart.Image_Key5 ?? "",
            }
          : row
      )
    );
  } catch (err) {
    console.error("Part update error:", err);
  }
};
  
  const handleDeleteRows = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    try {
      await Promise.all(
        ids.map(async (partId) => {
          const res = await fetch(`http://localhost:3000/api/parts/${partId}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
          }
        })
      );

      setRows((prev) => prev.filter((row) => !ids.includes(row.id)));

      setRowSelectionModel({
        type: "include",
        ids: new Set(),
      });

      setOpenDelete(false);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const imageCell = (value: string) => (
    <Stack direction="row">
      <Box
        component="img"
        sx={{
          height: 70,
          width: 70,
          objectFit: "cover",
        }}
        alt="No Image available"
        src={value || ""}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = noImage;
        }}
      />
    </Stack>
  );

  /* declares name of columns and settings */
    const columns: GridColDef[] = [
    { field: "Part_Name", headerName: "Name", width: 200, editable: true },
    { field: "stock", headerName: "Stock", width: 150, editable: true, type: "number" },
    { field: "description", headerName: "Description", width: 200, editable: true },
    { field: "editPictures",
      headerName: "Pictures",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => openPictureEditor(params.row as PartRow)}
        >
          Edit Pictures
        </Button>
      ),
    },
    {
      field: "image",
      headerName: "Image",
      width: 120,
      editable: false,
      renderCell: (params) => imageCell(params.value || ""),
    },
    {
      field: "image2",
      headerName: "Image2",
      width: 120,
      editable: false,
      renderCell: (params) => imageCell(params.value || ""),
    },
    {
      field: "image3",
      headerName: "Image3",
      width: 120,
      editable: false,
      renderCell: (params) => imageCell(params.value || ""),
    },
    {
      field: "image4",
      headerName: "Image4",
      width: 120,
      editable: false,
      renderCell: (params) => imageCell(params.value || ""),
    },
    {
      field: "image5",
      headerName: "Image5",
      width: 120,
      editable: false,
      renderCell: (params) => imageCell(params.value || ""),
    },
  ];

    return (
    <>
      <Box sx={{ height: "65vh", width: "80vw" }}>
        {loading ? (
          <Stack sx={{ height: "100%" }} justifyContent="center" alignItems="center">
            <CircularProgress />
          </Stack>
        ) : (
          <DataGrid
            sx={{
              "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
                {
                  display: "none",
                },
            }}
            rows={rows}
            columns={columns}
            getRowHeight={() => "auto"}
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

      <Dialog
        open={openPictureDialog}
        onClose={() => setOpenPictureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Part Pictures</DialogTitle>

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

      <Backdrop open={openDelete} sx={{ color: "#fff", zIndex: 1300 }}>
        <Paper sx={{ width: 400, p: 4 }}>
          <Typography align="center" sx={{ fontWeight: "bold", fontSize: "h6.fontSize" }}>
            Delete {selectedIds.length} parts?
          </Typography>
          <Stack direction="row" spacing={4} mt={3} justifyContent="center">
            <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteRows}>
              Confirm
            </Button>
          </Stack>
        </Paper>
      </Backdrop>

      <Stack direction="row" spacing={2} sx={{ position: "fixed", top: 32, right: 32 }}>
        <Stack direction="row" spacing={2} sx={{ position: "fixed", top: 32, right: 32 }}>
          <Fab
            color="primary"
            aria-label="add-part"
            onClick={() => navigate("/admin/create-part")}
          >
            <AddIcon />
          </Fab>

          <Fab
            color="secondary"
            aria-label="delete-part"
            disabled={selectedIds.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <DeleteIcon />
          </Fab>
        </Stack>
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
export default PartsTable;
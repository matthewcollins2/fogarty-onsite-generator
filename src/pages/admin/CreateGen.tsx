import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateGen: React.FC = () => {
  const [genID, setGenid] = useState("");
  const [Serial_Number, setSerial_Number] = useState("");
  const [name, setName] = useState("");
  const [Description, setDescription] = useState("");
  const [Stock, setStock] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  // slot 1
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [manualImageUrl1, setManualImageUrl1] = useState("");

  // slot 2
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [manualImageUrl2, setManualImageUrl2] = useState("");

  // slot 3
  const [imageFile3, setImageFile3] = useState<File | null>(null);
  const [manualImageUrl3, setManualImageUrl3] = useState("");

  //slot 4
  const [imageFile4, setImageFile4] = useState<File | null>(null);
  const [manualImageUrl4, setManualImageUrl4] = useState("");

  //slot 5
  const [imageFile5, setImageFile5] = useState<File | null>(null);
  const [manualImageUrl5, setManualImageUrl5] = useState("");

  const navigate = useNavigate();

  const uploadImageIfNeeded = async (
    file: File | null,
    manualUrl: string
  ): Promise<{ imageUrl: string; imageKey: string }> => {
    // if file exists, upload to S3
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

    // otherwise use pasted URL
    if (manualUrl.trim()) {
      return {
        imageUrl: manualUrl.trim(),
        imageKey: "",
      };
    }

    // nothing provided
    return {
      imageUrl: "",
      imageKey: "",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMsg("");

    try {
      const slot1 = await uploadImageIfNeeded(imageFile1, manualImageUrl1);
      const slot2 = await uploadImageIfNeeded(imageFile2, manualImageUrl2);
      const slot3 = await uploadImageIfNeeded(imageFile3, manualImageUrl3);
      const slot4 = await uploadImageIfNeeded(imageFile4, manualImageUrl4);
      const slot5 = await uploadImageIfNeeded(imageFile5, manualImageUrl5);
      const response = await fetch("http://localhost:3000/api/generators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genID,
          name,
          Description,
          Stock: Number(Stock),
          Serial_Number,

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

      const result = await response.json();

      if (!response.ok) {
        setResponseMsg(result.message || "Error adding Generator.");
      } else {
        setResponseMsg(result.message || "Generator added successfully!");

        setGenid("");
        setName("");
        setDescription("");
        setStock("");
        setSerial_Number("");

        setImageFile1(null);
        setManualImageUrl1("");

        setImageFile2(null);
        setManualImageUrl2("");

        setImageFile3(null);
        setManualImageUrl3("");

        setImageFile4(null);
        setManualImageUrl4("");

        setImageFile5(null);
        setManualImageUrl5("");

        navigate("/admin/inven-management");
      }
    } catch (error) {
      setResponseMsg(
        error instanceof Error ? error.message : "Error connecting to server."
      );
      console.error(error);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Fogarty Onsite</h1>
        <h1>Generator Service</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          margin: "auto",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3>Add a generator</h3>
        </div>

        <input
          type="text"
          placeholder="Serial Number"
          value={Serial_Number}
          onChange={(e) => setSerial_Number(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Generator Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Description"
          value={Description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Stock"
          value={Stock}
          onChange={(e) => setStock(e.target.value)}
          required
          style={inputStyle}
        />

        <ImageSlot
          title="Image Slot 1"
          manualUrl={manualImageUrl1}
          setManualUrl={setManualImageUrl1}
          setFile={setImageFile1}
        />

        <ImageSlot
          title="Image Slot 2"
          manualUrl={manualImageUrl2}
          setManualUrl={setManualImageUrl2}
          setFile={setImageFile2}
        />

        <ImageSlot
          title="Image Slot 3"
          manualUrl={manualImageUrl3}
          setManualUrl={setManualImageUrl3}
          setFile={setImageFile3}
        />

        <ImageSlot
          title="Image Slot 4"
          manualUrl={manualImageUrl4}
          setManualUrl={setManualImageUrl4}
          setFile={setImageFile4}
        />

        <ImageSlot
          title="Image Slot 5"
          manualUrl={manualImageUrl5}
          setManualUrl={setManualImageUrl5}
          setFile={setImageFile5}
        />

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button type="submit">Add Generator</button>
        </div>
      </form>

      {responseMsg && (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>{responseMsg}</p>
      )}
    </div>
  );
};

type ImageSlotProps = {
  title: string;
  manualUrl: string;
  setManualUrl: React.Dispatch<React.SetStateAction<string>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

const ImageSlot: React.FC<ImageSlotProps> = ({
  title,
  manualUrl,
  setManualUrl,
  setFile,
}) => {
  return (
    <div
      style={{
        width: "80%",
        margin: "1rem auto",
        padding: "0.75rem",
        border: "1px solid #ddd",
        borderRadius: "6px",
        backgroundColor: "#fafafa",
      }}
    >
      <h4 style={{ margin: "0 0 0.75rem 0" }}>{title}</h4>

      <input
        type="text"
        placeholder="Paste image URL"
        value={manualUrl}
        onChange={(e) => setManualUrl(e.target.value)}
        style={fullInputStyle}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
        }}
      />
    </div>
  );
};

const inputStyle = {
  display: "block",
  width: "80%",
  margin: "0.5rem auto",
  padding: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const fullInputStyle = {
  display: "block",
  width: "100%",
  padding: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  boxSizing: "border-box" as const,
};

export default CreateGen;
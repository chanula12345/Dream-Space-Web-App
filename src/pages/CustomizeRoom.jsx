import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/CustomizeRoom.css";

const furnitureOptions = {
  bed1blue: "/src/assets/2d/Bed/bed1blue.png",
  bed1red: "/src/assets/2d/Bed/bed1red.png",
  bed1white: "/src/assets/2d/Bed/bed1white.png",
  bed2blue: "/src/assets/2d/Bed/bed2blue.png",
  bed2red: "/src/assets/2d/Bed/bed2red.png",
  bed2white: "/src/assets/2d/Bed/bed2white.png",

  chair1blue: "/src/assets/2d/Chair/chair1blue.png",
  chair1brown: "/src/assets/2d/Chair/chair1brown.png",
  chair1red: "/src/assets/2d/Chair/chair1red.png",
  chair1white: "/src/assets/2d/Chair/chair1white.png",

  sofa1blue: "/src/assets/2d/Sofa/Sofa 1/sofa1blue.png",
  sofa1brown: "/src/assets/2d/Sofa/Sofa 1/sofa1brown.png",
  sofa1white: "/src/assets/2d/Sofa/Sofa 1/sofa1white.png",

  sofa2blue: "/src/assets/2d/Sofa/Sofa 2/sofa2blue.png",
  sofa2brown: "/src/assets/2d/Sofa/Sofa 2/sofa2brown.png",
  sofa2gray: "/src/assets/2d/Sofa/Sofa 2/sofa2gray.png",
  sofa2green: "/src/assets/2d/Sofa/Sofa 2/sofa2green.png",

  table1bl: "/src/assets/2d/Table/table1bl.png",
  table1br: "/src/assets/2d/Table/table1br.png",
  table1w: "/src/assets/2d/Table/table1w.png",
};

const furnitureLabels = {
  bed1blue: "Bed 1 Blue",
  bed1red: "Bed 1 Red",
  bed1white: "Bed 1 White",
  bed2blue: "Bed 2 Blue",
  bed2red: "Bed 2 Red",
  bed2white: "Bed 2 White",

  chair1blue: "Chair 1 Blue",
  chair1brown: "Chair 1 Brown",
  chair1red: "Chair 1 Red",
  chair1white: "Chair 1 White",

  sofa1blue: "Sofa 1 Blue",
  sofa1brown: "Sofa 1 Brown",
  sofa1white: "Sofa 1 White",

  sofa2blue: "Sofa 2 Blue",
  sofa2brown: "Sofa 2 Brown",
  sofa2gray: "Sofa 2 Gray",
  sofa2green: "Sofa 2 Green",

  table1bl: "Table Blue",
  table1br: "Table Brown",
  table1w: "Table White",
};

const defaultSizeByType = {
  bed: { width: 220, height: 140 },
  chair: { width: 95, height: 95 },
  sofa: { width: 180, height: 110 },
  table: { width: 120, height: 90 },
};

const getFurnitureKind = (key) => {
  if (key.startsWith("bed")) return "bed";
  if (key.startsWith("chair")) return "chair";
  if (key.startsWith("sofa")) return "sofa";
  if (key.startsWith("table")) return "table";
  return "chair";
};

const CustomizeRoom = () => {
  const [wallColor, setWallColor] = useState("#ffffff");
  const [wallpaper, setWallpaper] = useState(null);
  const [selectedFurniture, setSelectedFurniture] = useState("bed1blue");
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const previewRef = useRef(null);
  const navigate = useNavigate();

  const selectedItem = useMemo(
    () => placedItems.find((item) => item.id === selectedItemId) || null,
    [placedItems, selectedItemId]
  );

  const handleWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setWallpaper(imageUrl);
    }
  };

  const addFurnitureToRoom = () => {
    const kind = getFurnitureKind(selectedFurniture);
    const defaultSize = defaultSizeByType[kind];

    const newItem = {
      id: Date.now(),
      key: selectedFurniture,
      src: furnitureOptions[selectedFurniture],
      label: furnitureLabels[selectedFurniture],
      x: 120 + placedItems.length * 18,
      y: 100 + placedItems.length * 12,
      width: defaultSize.width,
      height: defaultSize.height,
      rotation: 0,
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  const updateSelectedItem = (changes) => {
    if (!selectedItemId) return;

    setPlacedItems((prev) =>
      prev.map((item) =>
        item.id === selectedItemId ? { ...item, ...changes } : item
      )
    );
  };

  const moveSelected = (dx, dy) => {
    if (!selectedItem) return;

    const nextX = Math.max(0, selectedItem.x + dx);
    const nextY = Math.max(0, selectedItem.y + dy);

    updateSelectedItem({ x: nextX, y: nextY });
  };

  const resizeSelected = (delta) => {
    if (!selectedItem) return;

    updateSelectedItem({
      width: Math.max(40, selectedItem.width + delta),
      height: Math.max(40, selectedItem.height + delta),
    });
  };

  const rotateSelected = (delta) => {
    if (!selectedItem) return;
    updateSelectedItem({ rotation: selectedItem.rotation + delta });
  };

  const removeSelected = () => {
    if (!selectedItemId) return;
    setPlacedItems((prev) => prev.filter((item) => item.id !== selectedItemId));
    setSelectedItemId(null);
  };

  const clearRoom = () => {
    setPlacedItems([]);
    setSelectedItemId(null);
  };

  const exportPDF = async () => {
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "pt", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(18);
    pdf.text("Customized Room Preview", 40, 30);
    pdf.addImage(imgData, "PNG", 40, 50, pageWidth - 80, pageHeight - 90);

    pdf.save("custom-room.pdf");
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="custom-room-page">
        <div className="custom-room-layout">
          <aside className="custom-room-sidebar">
            <button className="custom-back-btn" onClick={() => navigate("/dashboard")}>
              ←
            </button>

            <h2>Customize Your Room</h2>
            <p className="custom-room-subtitle">
              Adjust the wall style, place furniture, and export the final room preview.
            </p>

            <div className="custom-form-group">
              <label>Wall Color</label>
              <input
                type="color"
                value={wallColor}
                onChange={(e) => setWallColor(e.target.value)}
                className="custom-color-input"
              />
            </div>

            <div className="custom-form-group">
              <label>Background Image</label>
              <input
                type="file"
                accept="image/*"
                className="custom-input"
                onChange={handleWallpaperUpload}
              />
            </div>

            <div className="custom-form-group">
              <label>Select Furniture</label>
              <select
                className="custom-select"
                value={selectedFurniture}
                onChange={(e) => setSelectedFurniture(e.target.value)}
              >
                <optgroup label="Beds">
                  <option value="bed1blue">Bed 1 Blue</option>
                  <option value="bed1red">Bed 1 Red</option>
                  <option value="bed1white">Bed 1 White</option>
                  <option value="bed2blue">Bed 2 Blue</option>
                  <option value="bed2red">Bed 2 Red</option>
                  <option value="bed2white">Bed 2 White</option>
                </optgroup>

                <optgroup label="Chairs">
                  <option value="chair1blue">Chair 1 Blue</option>
                  <option value="chair1brown">Chair 1 Brown</option>
                  <option value="chair1red">Chair 1 Red</option>
                  <option value="chair1white">Chair 1 White</option>
                </optgroup>

                <optgroup label="Sofa 1">
                  <option value="sofa1blue">Sofa 1 Blue</option>
                  <option value="sofa1brown">Sofa 1 Brown</option>
                  <option value="sofa1white">Sofa 1 White</option>
                </optgroup>

                <optgroup label="Sofa 2">
                  <option value="sofa2blue">Sofa 2 Blue</option>
                  <option value="sofa2brown">Sofa 2 Brown</option>
                  <option value="sofa2gray">Sofa 2 Gray</option>
                  <option value="sofa2green">Sofa 2 Green</option>
                </optgroup>

                <optgroup label="Tables">
                  <option value="table1bl">Table Blue</option>
                  <option value="table1br">Table Brown</option>
                  <option value="table1w">Table White</option>
                </optgroup>
              </select>
            </div>

            <button className="custom-primary-btn" onClick={addFurnitureToRoom}>
              Add Furniture
            </button>

            <div className="custom-tools-card">
              <div className="custom-tools-title-row">
                <h4>Selected Item Tools</h4>
                <span>{selectedItem ? selectedItem.label : "None selected"}</span>
              </div>

              <div className="tool-grid">
                <button onClick={() => moveSelected(0, -10)} disabled={!selectedItem}>
                  Up
                </button>
                <button onClick={() => moveSelected(0, 10)} disabled={!selectedItem}>
                  Down
                </button>
                <button onClick={() => moveSelected(-10, 0)} disabled={!selectedItem}>
                  Left
                </button>
                <button onClick={() => moveSelected(10, 0)} disabled={!selectedItem}>
                  Right
                </button>
              </div>

              <div className="tool-grid">
                <button onClick={() => resizeSelected(10)} disabled={!selectedItem}>
                  Size +
                </button>
                <button onClick={() => resizeSelected(-10)} disabled={!selectedItem}>
                  Size -
                </button>
                <button onClick={() => rotateSelected(10)} disabled={!selectedItem}>
                  Rotate +
                </button>
                <button onClick={() => rotateSelected(-10)} disabled={!selectedItem}>
                  Rotate -
                </button>
              </div>

              <button
                className="custom-danger-btn"
                onClick={removeSelected}
                disabled={!selectedItem}
              >
                Remove Selected
              </button>
            </div>

            <div className="custom-action-stack">
              <button className="custom-secondary-btn" onClick={exportPDF}>
                Export to PDF
              </button>

              <button className="custom-light-btn" onClick={clearRoom}>
                Clear Room
              </button>
            </div>
          </aside>

          <main className="custom-room-main">
            <div className="custom-room-header">
              <h1>Room Preview</h1>
              <p>
                Click a furniture item to select it, then use the controls on the left.
              </p>
            </div>

            <div className="custom-preview-card">
              <div className="room-stage" ref={previewRef}>
                <div
                  className="room-wall"
                  style={{
                    backgroundColor: wallColor,
                    backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="room-floor" />

                {placedItems.map((item) => (
                  <img
                    key={item.id}
                    src={item.src}
                    alt={item.label}
                    className={`room-furniture ${
                      selectedItemId === item.id ? "selected" : ""
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                      transform: `rotate(${item.rotation}deg)`,
                    }}
                    onClick={() => setSelectedItemId(item.id)}
                    draggable={false}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomizeRoom;
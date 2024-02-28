import React, {
  MutableRefObject,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "./application.css";
import "ol/ol.css";
import { Layer } from "ol/layer";
import { MapBrowserEvent } from "ol";
import { map, MapContext } from "../map/mapContext";
import { EmergencyAside } from "../emergency-shelter/emergencyAside";
import { EmergencyLayerCheckbox } from "../emergency-shelter/emergencyLayerCheckbox";
import { CivilAside } from "../civil-defense-region/CivilAside";
import { CivilLayerCheckbox } from "../civil-defense-region/civilLayerCheckbox";

export function Application() {
  useEffect(() => map.setView(new View({ center: [10, 59], zoom: 5 })), []);

  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );
  const [featureLayers, setFeatureLayers] = useState<Layer[]>([]);

  const layers = useMemo(
    () => [baseLayer, ...featureLayers],
    [baseLayer, featureLayers],
  );

  useEffect(() => {
    map.setLayers(layers);
  }, [layers, featureLayers]);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  useEffect(() => {
    const handleMapClick = (event: MapBrowserEvent<MouseEvent>) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const properties = feature.getProperties();
        console.log(properties.romnr, properties.plasser, properties.adresse);
        console.log(properties.navn, properties.url);
      });
    };

    map.on("singleclick", handleMapClick);

    return () => {
      map.un("singleclick", handleMapClick);
    };
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  // Function to handle focusing on user's location
  function handleFocusUser(event: React.MouseEvent) {
    event.preventDefault();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.getView().setCenter([longitude, latitude]);
        map.getView().setZoom(15);
      },
      (error) => {
        console.error("Error getting user location:", error);
      },
    );
  }

  return (
    <MapContext.Provider
      value={{ map, featureLayers, setFeatureLayers, setBaseLayer }}
    >
      <header>
        <h1>Map</h1>
        <input
          type="text"
          placeholder="my location"
          onChange={handleSearchInput}
        />
        <input
          type="text"
          placeholder="to location"
          onChange={handleSearchInput}
        />
        <button>Search</button>
      </header>
      <nav>
        <button className="btn-led" onClick={handleFocusUser}>
          My Location
        </button>
        <div className="nav-item">
          <EmergencyLayerCheckbox />
        </div>
        <div className="nav-item">
          <CivilLayerCheckbox />
        </div>
      </nav>
      <main>
        <div ref={mapRef} className="mapContainer"></div>
        <EmergencyAside />
        <CivilAside />
      </main>
    </MapContext.Provider>
  );
}

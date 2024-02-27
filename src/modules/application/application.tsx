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
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import "./application.css";
import "ol/ol.css";
import { Layer } from "ol/layer";
import { MapBrowserEvent } from "ol";
import { map, MapContext } from "../map/mapContext";
import { EmergencyAside } from "../emergrncy-shelter/emergencyAside";
import { EmergencyLayerCheckbox } from "../emergrncy-shelter/emergencyLayerCheckbox";
import { CivilAside } from "../civil-defense-region/CivilAside";
import { CivilLayerCheckbox } from "..//civil-defense-region/civilLayerCheckbox";
import VectorLayer from "ol/layer/Vector";

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
    map.getView().on("change:resolution", updateStylesBasedOnZoom);
  }, [layers, featureLayers]);

  const updateStylesBasedOnZoom = () => {
    const zoom = map.getView().getZoom() || 0;
    featureLayers.forEach((layer) => {
      if (layer instanceof VectorLayer) {
        const style = createStyle(zoom);
        layer.setStyle(style);
      }
    });
  };

  const createStyle = (zoom: number) => {
    return new Style({
      image: new CircleStyle({
        radius: zoom * 1,
        fill: new Fill({ color: "red" }),
        stroke: new Stroke({ color: "black" }),
      }),
    });
  };

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
        <EmergencyLayerCheckbox />
        <CivilLayerCheckbox />
      </nav>
      <main>
        <div ref={mapRef} className="mapContainer"></div>
        <EmergencyAside />
        <CivilAside />
      </main>
    </MapContext.Provider>
  );
}

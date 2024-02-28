import { useContext, useEffect, useState } from "react";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Feature, MapBrowserEvent } from "ol";
import { Point } from "ol/geom";
import Overlay from "ol/Overlay"; // Import Overlay from ol
import { MapContext } from "../map/mapContext";
import { normalCivilStyle, hoverCivilStyle, CivilFeature } from "./civilStyle";

const civilFileLocation = "./data/Sivilforsvarsdistrikter.json";

export function CivilLayerCheckbox() {
  const { map, setFeatureLayers } = useContext(MapContext);
  const [checked, setChecked] = useState(false);
  const [activeFeature, setActiveFeature] = useState<CivilFeature | undefined>(
    undefined,
  );

  useEffect(() => {
    const civilLayer = new VectorLayer({
      source: new VectorSource({
        url: civilFileLocation,
        format: new GeoJSON(),
      }),
      visible: checked,
      style: normalCivilStyle, // Set initial style
    });

    if (checked) {
      setFeatureLayers((prevLayers) => [...prevLayers, civilLayer]);
    } else {
      setFeatureLayers((prevLayers) =>
        prevLayers.filter((layer) => layer !== civilLayer),
      );
    }

    function handlePointerMove(e: MapBrowserEvent<MouseEvent>) {
      const features: Feature<Point>[] = [];
      map.forEachFeatureAtPixel(
        e.pixel,
        (f) => {
          e.stopPropagation(); // Prevent further event propagation to stop the zoom effect
          features.push(f as Feature<Point>);
        },
        {
          hitTolerance: 5,
          layerFilter: (l) => l === civilLayer,
        },
      );
      if (features.length === 1) {
        setActiveFeature(features[0] as unknown as CivilFeature);
        // Clear existing overlays
        map.getOverlays().clear();
        // Display link bubble on the map
        const properties = features[0].getProperties();
        const linkBubble = document.createElement("div");
        linkBubble.className = "link-bubble";
        linkBubble.innerHTML = `
      <a href="${properties.url}" target="_blank" rel="noopener noreferrer">
        ${properties.url}
      </a>
    `;
        map.addOverlay(
          new Overlay({
            element: linkBubble,
            position: e.coordinate,
          }),
        );
      } else {
        setActiveFeature(undefined);
        // Clear any existing link bubble
        map.getOverlays().clear();
      }
    }

    if (checked) {
      map?.on("pointermove", handlePointerMove);
    } else {
      map?.un("pointermove", handlePointerMove);
    }

    return () => {
      map?.un("pointermove", handlePointerMove);
      if (checked) {
        setFeatureLayers((prevLayers) =>
          prevLayers.filter((layer) => layer !== civilLayer),
        );
      }
    };
  }, [checked, setFeatureLayers, map]);

  useEffect(() => {
    // Apply hover style when feature is active
    if (activeFeature) {
      activeFeature.setStyle(hoverCivilStyle);
    } else {
      map?.getLayers().forEach((layer) => layer.changed());
    }
    return () => {
      // Restore normal style when feature is inactive
      activeFeature?.setStyle(normalCivilStyle);
    };
  }, [activeFeature, map]);

  return (
    <div>
      <label>
        <input
          type={"checkbox"}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Show Civil Defense Regions
      </label>
    </div>
  );
}

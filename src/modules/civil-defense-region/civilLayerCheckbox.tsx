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

        // Create a container for the link bubble content
        const linkBubbleContainer = document.createElement("div");
        linkBubbleContainer.className = "link-bubble-container";

        // Create the link element
        const linkElement = document.createElement("a");
        linkElement.href = properties.url;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.textContent = properties.url;

        // Create the additional message element
        const messageElement = document.createElement("p");
        messageElement.textContent = "  --> Click for more info!";

        // Append the link and message elements to the container
        linkBubbleContainer.appendChild(linkElement);
        linkBubbleContainer.appendChild(messageElement);

        // Set the content of the link bubble to the container
        const linkBubble = document.createElement("div");
        linkBubble.className = "link-bubble";
        linkBubble.appendChild(linkBubbleContainer);

        // Convert map coordinates to pixels
        const pixel = map.getPixelFromCoordinate(e.coordinate);
        // Add offset to position the overlay slightly above the feature
        pixel[1] -= 10;
        const position = map.getCoordinateFromPixel(pixel);
        map.addOverlay(
          new Overlay({
            element: linkBubble,
            position: position,
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
    if (activeFeature) {
      activeFeature.setStyle(hoverCivilStyle);
    } else {
      map?.getLayers().forEach((layer) => layer.changed());
    }
    return () => {
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

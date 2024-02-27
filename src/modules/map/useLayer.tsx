import { Layer } from "ol/layer";
import { useContext, useEffect } from "react";
import { MapContext } from "./mapContext";

//we create useLayer hook to add or remove layers from the map
export function useLayer(layer: Layer, checked: boolean) {
  const { setFeatureLayers } = useContext(MapContext);

  function checkd() {
    if (checked) {
      setFeatureLayers((old) => [...old, layer]);
    }
    return () => {
      setFeatureLayers((old) => old.filter((l) => l !== layer));
    };
  }
  useEffect(checkd, [checked]);
}

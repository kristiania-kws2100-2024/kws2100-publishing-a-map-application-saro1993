// create a context for the map, is this case we are using the ol library
import React, { Dispatch, SetStateAction } from "react";
import { Map, View } from "ol";
import { Layer } from "ol/layer";
import { useGeographic } from "ol/proj";
import { defaults, ScaleLine } from "ol/control";

// eslint-disable-next-line react-hooks/rules-of-hooks
useGeographic();

export const map = new Map({
  view: new View({ center: [10, 59], zoom: 8 }),
  controls: defaults().extend([new ScaleLine()]),
});

// create a context for the map
export const MapContext = React.createContext<{
  map: Map;
  setBaseLayer: (layer: Layer) => void;
  setFeatureLayers: Dispatch<SetStateAction<Layer[]>>;
  featureLayers: Layer[];
}>({ map,
  setBaseLayer: () => {},
  setFeatureLayers: () => {},
  featureLayers: [],
});
console.log(map);

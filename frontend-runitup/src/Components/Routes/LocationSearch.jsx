import React, { useState } from "react";
import { AutoComplete } from "antd";
import mapboxgl from "mapbox-gl";

const LocationSearch = ({ placeholder, onChange }) => {
  const [options, setOptions] = useState([]);

  const handleSearch = async (value) => {
    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value
          )}.json?access_token=${
            mapboxgl.accessToken
          }&types=address,place,locality,neighborhood`
        );
        const data = await response.json();
        const newOptions = data.features.map((feature) => ({
          value: feature.place_name,
          label: feature.place_name,
        }));
        setOptions(newOptions);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setOptions([]);
    }
  };

  const handleSelect = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <AutoComplete
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      placeholder={placeholder}
      style={{ width: 300 }}
    />
  );
};

export default LocationSearch;

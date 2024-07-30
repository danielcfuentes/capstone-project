import React, { useState, useEffect } from "react";
import { AutoComplete } from "antd";
import mapboxgl from "mapbox-gl";

const LocationSearch = ({ placeholder, onChange, value }) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleSearch = async (value) => {
    setInputValue(value);
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
    setInputValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <AutoComplete
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onChange={setInputValue}
      value={inputValue}
      placeholder={placeholder}
      style={{ width: 300 }}
    />
  );
};

export default LocationSearch;

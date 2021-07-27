// import { Select } from "@airtable/blocks/ui";
import React from "react";
import Select from "react-select";

function SelectList({ obj, value, setValue }) {
  const label = obj.find((item) => item.value == value).label;

  return (
    <div style={{ maxWidth: 580, minWidth: 120 }}>
      <Select
        options={obj}
        value={value}
        onChange={(newValue) => {
          setValue(newValue.value);
        }}
        placeholder={label}
      />
    </div>
  );
}

export default SelectList;

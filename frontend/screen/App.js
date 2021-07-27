import { Box, Text, SelectButtons } from "@airtable/blocks/ui";
import React, { useState } from "react";

import TeacherCalendar from "./teacher_calendar";
import StudentCalendar from "./student_calendar";

function App() {
  const options = [
    {
      value: "GV",
      label: "Giáo viên",
    },
    {
      value: "HV",
      label: "Học viên",
    },
  ];

  const [changeButton, setChangeButton] = useState(options[1].value);

  return (
    
    <Box style={{ marginLeft: 12 }}>
      <Text
        style={{
          marginTop: 8,
          marginBottom: 8,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        Tạo lịch cho:
      </Text>
      <SelectButtons
        value={changeButton}
        onChange={(newValue) => setChangeButton(newValue)}
        options={options}
        width="460px"
        style={{ color: "red", fontSize: 18, fontWeight: "500" }}
      />
      <Box
        style={{
          backgroundColor: "black",
          height: 2,
          width: "100%",
          marginTop: 8,
          marginBottom: 8,
        }}
      />
      
      {changeButton == "GV" ? <TeacherCalendar /> : <StudentCalendar />}
    </Box>
  );
}

export default App;

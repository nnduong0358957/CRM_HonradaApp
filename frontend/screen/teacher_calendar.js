import {
  useBase,
  useRecords,
  Input,
  Box,
  Text,
  Button,
} from "@airtable/blocks/ui";
import React, { useState } from "react";

import SelectList from "../component/select";
import ShowDialog from "../component/dialog";
import TableCheckbox from "../component/table_checkbox";
import { dayOfWeek } from "../constrants";

function TeacherCalendar() {
  const base = useBase();

  const table = base.getTableByName("Giáo viên");
  const records = useRecords(table);
  const fieldStatusTeacher = table.getFieldByName("Status");

  const tableCalendar = base.getTableByName("📆 Lịch làm việc");
  const recordsCalendar = useRecords(tableCalendar);
  const fieldDateTime = tableCalendar.getFieldByName("Datetime");
  const fieldTeacher = tableCalendar.getFieldByName("Giáo Viên");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [listSelected, setListSelected] = useState([]);

  const obj = setDefaultIfNull(
    records
      .filter(
        (item) =>
          item.getCellValue(fieldStatusTeacher) != null &&
          item.getCellValue(fieldStatusTeacher).name == "Done"
      )
      .map((item) => ({
        value: item.id,
        label: item.name,
      }))
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0))
  );

  const [teacher, setTeacher] = useState(obj[0].value);

  return (
    <Box border="thick" padding={3} margin={1}>
      <SelectList obj={obj} value={teacher} setValue={setTeacher} />

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        marginY={3}
        maxWidth={360}
      >
        <Input
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            const date = new Date(e.target.value);
            setEndDate(
              new Date(date.setMonth(date.getMonth() + 6))
                .toISOString()
                .substring(0, 10)
            );
          }}
          type="date"
        />
        <Text marginX={2}>đến</Text>
        <Input
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          type="date"
        />
      </Box>
      <TableCheckbox
        listSelected={listSelected}
        setListSelected={setListSelected}
      />
      {isDialogOpen && (
        <ShowDialog setIsDialogOpen={setIsDialogOpen} message={message} />
      )}

      <Button
        style={{
          marginTop: 12,
          backgroundColor: "#7572ed",
          color: "white",
          fontSize: 16,
        }}
        onClick={() => {
          if (startDate == "" || endDate == "") {
            setMessage("Bạn vui lòng nhập đầy đủ thông tin");
          } else if (new Date(startDate) >= new Date(endDate)) {
            setMessage("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
          } else {
            let linkedTeacher = [];
            let recordsData = [];
            let count = 0;

            for (const record of records) {
              if (record.id == teacher)
                linkedTeacher.push({ id: record.id, name: record.name });
            }

            for (
              let d = new Date(startDate);
              d <= new Date(endDate);
              d.setDate(d.getDate() + 1)
            ) {
              listSelected.forEach(async (item) => {
                if (dayOfWeek[d.getDay()] === item.day) {
                  let isDuplicate = false;

                  // Kiểm tra xem đã tồn tại Record này hay chưa
                  for (const record of recordsCalendar) {
                    const dateRecord =
                      record.getCellValue(fieldDateTime) != null
                        ? record.getCellValue(fieldDateTime).substring(0, 10)
                        : "Lỗi không có dữ liệu";
                    const dateToAdd = d.toISOString().substring(0, 10);
                    const hourRecord = new Date(
                      record.getCellValue(fieldDateTime)
                    ).getUTCHours();
                    const teacherRecord = record.getCellValue(fieldTeacher);

                    if (
                      teacherRecord != null &&
                      teacherRecord[0].id === linkedTeacher[0].id &&
                      dateRecord == dateToAdd &&
                      hourRecord == item.time
                    ) {
                      isDuplicate = true;
                      break;
                    }
                  }

                  // Thêm mới record
                  if (!isDuplicate) {
                    count++;
                    recordsData.push({
                      fields: {
                        "Giáo Viên": linkedTeacher,
                        Datetime: new Date(
                          new Date(d).setUTCHours(item.time)
                        ).toISOString(),
                      },
                    });
                  }
                }
              });
            }

            if (recordsData.length > 0) {
              let startCreate = 0;
              while (count > 0) {
                const maxCreate = 46;
                tableCalendar.createRecordsAsync(
                  recordsData.slice(startCreate, startCreate + maxCreate)
                );

                count = count - maxCreate;
                startCreate = startCreate + maxCreate;
              }

              setMessage(
                "Tạo lịch thành công cho giáo viên " + linkedTeacher[0].name
              );
            } else {
              setMessage("Không có lịch mới được tạo");
            }
          }
          setIsDialogOpen(true);
        }}
      >
        Tạo lịch
      </Button>
    </Box>
  );
}

function setDefaultIfNull(arr) {
  if (arr.length === 0) return [{ value: null, label: "Không có" }];
  else return arr;
}
export default TeacherCalendar;

import {
  useBase,
  useRecords,
  Input,
  Box,
  Text,
  Button,
  CellRenderer,
  SelectButtons,
} from "@airtable/blocks/ui";
import React, { useState } from "react";
import Select from "react-select";

import { dayOfWeekVietnam } from "../constrants";

import SelectList from "../component/select";
import ShowDialog from "../component/dialog";

function StudentCalendar() {
  const base = useBase();
  const tableStudent = base.getTableByName("Học viên");
  const recordsStudent = useRecords(tableStudent);
  const fieldsStudentStatus = tableStudent.getFieldByName("STATUS")

  const tableTeacher = base.getTableByName("Giáo viên");
  const recordsTeacher = useRecords(tableTeacher);
  const fieldCountryTeacher = tableTeacher.getFieldByName("Country");
  const fieldStatusTeacher = tableTeacher.getFieldByName("Status");

  const tableClass = base.getTableByName("Lớp học");
  const recordsClass = useRecords(tableClass);
  const fieldClassCourse = tableClass.getFieldByName("Khóa học chính thức")
  const fieldClassType = tableClass.getFieldByName("Hình thức buổi học");
  const fieldClassLong = tableClass.getFieldByName("Thời lượng buổi học"); 
  const fieldClassTeachers = tableClass.getFieldByName("Giáo viên dạy"); 
  const fieldClassStudents = tableClass.getFieldByName("Học viên"); 
  const fieldClassTimeTeach = tableClass.getFieldByName("Giờ mở lớp"); 
  const fieldClassDayTeach = tableClass.getFieldByName("Lịch mở lớp"); 
  const fieldClassDistributeSchedule = tableClass.getFieldByName("Phân bổ lịch");
  const fieldClassStatus = tableClass.getFieldByName("STATUS (from Học viên)");


  const tableCalendar = base.getTableByName("📆 Lịch làm việc");
  const recordsCalendar = useRecords(tableCalendar);
  const fieldClassCalendar = tableCalendar.getFieldByName("Lớp học");
  const fieldDateTimeCalendar = tableCalendar.getFieldByName("Datetime");
  const fieldTeacherCalendar = tableCalendar.getFieldByName("Giáo Viên");

  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  //----------------------------------------------------------------
  //Lọc danh sách lớp học
  const selectListClass = setDefaultIfNull(
    recordsClass
      .filter(
        (item) =>
          (item.getCellValue(fieldClassType) != null &&
          item.getCellValue(fieldClassStatus)[0] == "XẾP LỚP HỌC CHÍNH") &&
          item.getCellValue(fieldClassType).name == "Official - 1ONGROUP" || 
          item.getCellValue(fieldClassType).name == "Official - 1ON1"
      )
      .map((item) => ({
        value: item.id,
        label: item.name,
      }))
      // .sort((a, b) => {
      //   const splitNameA = a.label.trim().split(" ");
      //   const firstNameA = splitNameA[splitNameA.length - 1];

      //   const splitNameB = b.label.trim().split(" ");
      //   const firstNameB = splitNameB[splitNameB.length - 1];

      //   return firstNameA.localeCompare(firstNameB);
      // })
  );
  let timesPick = [];
  for (let i = 7; i <= 23; i++) timesPick.push(i);
  const selectListTime = timesPick.map((time) => ({
    value: time,
    label: `${time}h - ${time + 1}h`,
  }))

  // const [value1GV, setValue1GV] = useState(selectListTime[0].value);
  // const [valueGV1, setValueGV1] = useState(selectListTime[0].value);
  // const [valueGV2, setValueGV2] = useState(selectListTime[0].value);

  // const [teacher, setTeacher] = useState(selectListTeacher[0].value);
  // const [teacher1, setTeacher1] = useState(selectListTeacher[0].value);

  // const [teacher2, setTeacher2] = useState(selectListTeacher[0].value);

  const [classSelected, setClassSelected] = useState(selectListClass[0].value);

  const recordClassSelected = recordsClass.filter(
    (record) => record.id === classSelected
  )[0];

  const studentsID = recordClassSelected?.getCellValue(fieldClassStudents)
    .map((record) => record.id)
  const recordStudentInClass = studentsID && recordsStudent.filter(
    (record) => studentsID.includes(record.id)
  )
  //----------------------------------------------------------------


  // const listSelectDayStudent = dayOfWeekVietnam.map((item) => ({
  //   value: item,
  //   label: item,
  // }));

  // Xử lý thêm lịch cho 1 giáo viên
  const createStudentCalendarWith1Teacher = async () => {
    // let linkedStudent = [];
    let linkedTeacher = [];
    let updateData = [];
    let duplicateWithAnother = false;
    let dayStudy = recordClassSelected.getCellValue(fieldClassDayTeach).map((day) => ({
      value: day.name,
      label: day.name
    }));
    let timeStudy = recordClassSelected.getCellValue(fieldClassTimeTeach).name;
    let classStudents = recordStudentInClass
    let newClassId;
    let classPerWeek = 0;
    let missCalendar;

    // total để tính tổng cộng ngày đã duyệt qua
    let total = 0;
    // totalRecordsAdd để tính số lịch được thêm (không bị trùng) trong total lịch được tạo
    let totalRecordsAdd = 0;

    // //Duyệt qua các bản ghi của Học viên để tìm liên kết học viên đang được chọn trong bảng học viên
    // for (const record of recordsStudent) {
    //   if (record.id == student) {
    //     linkedStudent.push({
    //       id: record.id,
    //       name: record.name,
    //     });
    //     // Đọc giá trị thứ và thời gian học của học viên
    //     dayStudy = listDayMainStudy;
    //     timeStudy = value1GV;
    //   }
    // }

    // Tính số lượng buổi học trong 1 tuần
    classPerWeek = dayStudy.length;

    // Số lượng buổi học tối đa trong 1 khóa học (3 tháng)
    const maxCreate = 24; // Thêm input chọn số buổi học của khóa

    //Kiểm tra xem đã Học viên này đã có lớp trong bảng Lớp học hay chưa
    // const checkHaveClass = recordsClass.find((record) =>
    //   record.getCellValue(fieldStudentClass) != null
    //     ? record.getCellValue(fieldCourseClass).name === "Official"
    //       ? record.getCellValue(fieldStudentClass)[0].id == linkedStudent[0].id
    //       : null
    //     : null
    // );

    //Tìm giáo viên đang được chọn
    recordClassSelected.getCellValue(fieldClassTeachers).forEach((teacher) => {
      linkedTeacher.push({
        id: teacher.id,
        name: teacher.name
       })
    })
    // // Nếu CHƯA có lớp thì tạo lớp mới và lấy id. Nếu ĐÃ có lớp thì lấy id của lớp đó
    // if (checkHaveClass == null) {
    //   newClassId = await tableClass.createRecordAsync({
    //     "Học viên": linkedStudent,
    //     "Buổi học": { id: idOfficial },
    //   });
    // } else {
    //   newClassId = checkHaveClass.id;
    // }

    for (
      let d = new Date(startDate);
      d <= new Date(endDate);
      d.setDate(d.getDate() + 1)
    ) {
      for (const day of dayStudy) {
        console.log(day);
        if (dayOfWeekVietnam[d.getDay()] === day.label) {
          // Gán tên ngày học để tí nữa in ra ngày bị thiếu
          missCalendar = d.toISOString().slice(0, 10);
          const dayStudent = new Date(d).toISOString().substring(0, 10);

          const getHourStudy = parseInt(timeStudy.substring(0,2));

          for (const record of recordsCalendar) {
            const recordTeacher =
              record.getCellValue(fieldTeacherCalendar) != null
                ? record.getCellValue(fieldTeacherCalendar)[0].id
                : "Lỗi không có dữ liệu";

            if (recordTeacher == linkedTeacher[0].id) {
              const dayTeacher =
                record.getCellValue(fieldDateTimeCalendar) != null
                  ? record.getCellValue(fieldDateTimeCalendar).substring(0, 10)
                  : "Lỗi không có dữ liệu";
              if (dayStudent == dayTeacher) {
                const checkTime = new Date(
                  record.getCellValue(fieldDateTimeCalendar)
                ).getUTCHours();
                console.log(typeof checkTime);
                console.log(typeof getHourStudy);
                if (checkTime == getHourStudy) {
                  total++;

                  // Nếu có lịch thì gán lại bằng Null
                  missCalendar = null;
                  // Nếu giáo viên vẫn trống lịch thì thêm lớp học vào record
                  if (record.getCellValue(fieldClassCalendar) == null) {
                    if (totalRecordsAdd < maxCreate) {
                      totalRecordsAdd++;
                    } else break;
                    updateData.push({
                      id: record.id,
                      fields: { "Lớp học": [{ id: classSelected }] },
                    });
                  } else {
                    if (
                      record.getCellValue(fieldClassCalendar)[0].id ==
                      newClassId
                    ) {
                      
                    } else {
                      duplicateWithAnother = true;
                    }
                  }
                }
              }
              //
            }

            // Nếu giáo viên bị trùng lịch với học viên khác hoặc đã tới giới hạn số lớp trong khóa thì hủy vòng lặp
            if (duplicateWithAnother || total >= maxCreate) {
              // 2 trường hợp này là 2 trường hợp kết thúc khác nên đặt missCalendar lại bằng null
              missCalendar = null;
              break;
            }
          }
        }
      }
      if (missCalendar != null) break;
    }
    // Tách ra từng phần để tránh quá nhiều hành động trong 1s

    if (missCalendar == null) {
      if (!duplicateWithAnother && updateData.length > 0) {
        let startCreate = 0;
        let count = updateData.length;
        while (count > 0) {
          const maxCreate = 46;
          tableCalendar.updateRecordsAsync(
            updateData.slice(startCreate, startCreate + maxCreate)
          );
          count = count - maxCreate;
          startCreate = startCreate + maxCreate;
        }
        for(const student of classStudents){
          tableStudent.updateRecordAsync(
            student,
            {'STATUS': {id: "selsqj9i4FWZSFYKY", name: "ĐANG HỌC CHÍNH", color: "greenLight2"}}
          )
        }
        setMessage("Cập nhật " + totalRecordsAdd + " lịch thành công");
      } else {
        setMessage("Giáo viên được chọn không có đủ lịch trống");
      }
    } else setMessage("Giáo viên được chọn thiếu lịch vào " + missCalendar);
  };

  // Xử lý thêm lịch cho 2 giáo viên
  // const createStudentCalendarWith2Teacher = async () => {
  //   let linkedStudent = [];
  //   let linkedTeacher1 = [];
  //   let linkedTeacher2 = [];
  //   let updateData = [];
  //   let duplicateWithAnother = false;
  //   let dayStudy;
  //   let newClassId;
  //   let classPerWeek = 0;
  //   let missCalendar;
  //   // total để tính tổng cộng lịch học được tạo
  //   let total = 0;
  //   // totalRecordsAdd để tính số lịch được thêm (không bị trùng) trong total lịch được tạo
  //   let totalRecordsAdd = 0;

  //   //Lấy checkbox value (Thời gian dạy của giáo viên 1)
  //   let listGV1 = document.getElementsByClassName("gv1");
  //   let teacher1Schedule = [];

  //   for (let input of listGV1) {
  //     if (input.checked) {
  //       teacher1Schedule.push({
  //         day: input.name.slice(0, 2),
  //         time: getTimeInString(input.name.slice(3)),
  //       });
  //     }
  //   }

  //   // Lấy checkbox chưa check (Thời gian dạy của giáo viên 2)
  //   let listGV2 = document.getElementsByClassName("gv2");
  //   let teacher2Schedule = [];
  //   for (let input of listGV2) {
  //     if (input.checked) {
  //       teacher2Schedule.push({
  //         day: input.name.slice(0, 2),
  //         time: getTimeInString(input.name.slice(3)),
  //       });
  //     }
  //   }

  //   //Duyệt qua các bản ghi của Học viên để tìm liên kết học viên đang được chọn trong bảng học viên
  //   for (const record of recordsStudent) {
  //     if (record.id == student) {
  //       linkedStudent.push({
  //         id: record.id,
  //         name: record.name,
  //       });
  //       // Đọc giá trị thứ và thời gian học của học viên
  //       dayStudy = listDayMainStudy;
  //     }
  //   }

  //   // Tính số lượng buổi học trong 1 tuần
  //   classPerWeek = teacher1Schedule.length + teacher2Schedule.length;

  //   // Số lượng buổi học tối đa trong 1 khóa học (3 tháng)
  //   const maxCreate = classPerWeek * 4 * 3;
  //   console.log(dayStudy);
  //   console.log(classPerWeek);

  //   //Kiểm tra xem đã Học viên này đã có lớp trong bảng Lớp học hay chưa
  //   const checkHaveClass = recordsClass.find((record) =>
  //     record.getCellValue(fieldStudentClass) != null
  //       ? record.getCellValue(fieldCourseClass).name === "Official"
  //         ? record.getCellValue(fieldStudentClass)[0].id == linkedStudent[0].id
  //         : null
  //       : null
  //   );

  //   //Tìm giáo viên đang được chọn
  //   for (const record of recordsTeacher) {
  //     if (record.id == teacher1)
  //       linkedTeacher1.push({ id: record.id, name: record.name });
  //   }
  //   for (const record of recordsTeacher) {
  //     if (record.id == teacher2)
  //       linkedTeacher2.push({ id: record.id, name: record.name });
  //   }

  //   // Nếu CHƯA có lớp thì tạo lớp mới và lấy id. Nếu ĐÃ có lớp thì lấy id của lớp đó
  //   if (checkHaveClass == null) {
  //     newClassId = await tableClass.createRecordAsync({
  //       "Học viên": linkedStudent,
  //       "Buổi học": { id: idOfficial },
  //     });
  //   } else {
  //     newClassId = checkHaveClass.id;
  //   }

  //   for (
  //     let d = new Date(startDate);
  //     d <= new Date(endDate);
  //     d.setDate(d.getDate() + 1)
  //   ) {
  //     for (const dayGV1 of teacher1Schedule) {
  //       if (dayOfWeekVietnam[d.getDay()] === dayGV1.day) {
  //         // Gán tên ngày học để tí nữa in ra ngày bị thiếu
  //         missCalendar = d.toISOString().slice(0, 10);
  //         const dayStudent = new Date(d).toISOString().substring(0, 10);

  //         for (const record of recordsCalendar) {
  //           const recordTeacher =
  //             record.getCellValue(fieldTeacherCalendar) != null
  //               ? record.getCellValue(fieldTeacherCalendar)[0].id
  //               : "Lỗi không có dữ liệu";

  //           if (recordTeacher == linkedTeacher1[0].id) {
  //             const dayTeacher =
  //               record.getCellValue(fieldDateTimeCalendar) != null
  //                 ? record.getCellValue(fieldDateTimeCalendar).substring(0, 10)
  //                 : "Lỗi không có dữ liệu";

  //             if (dayStudent == dayTeacher) {
  //               const checkTime = new Date(
  //                 record.getCellValue(fieldDateTimeCalendar)
  //               ).getUTCHours();

  //               if (checkTime == valueGV1) {
  //                 total++;

  //                 // Nếu có lịch thì gán lại bằng Null
  //                 missCalendar = null;
  //                 // Nếu giáo viên vẫn trống lịch thì thêm lớp học vào record
  //                 if (record.getCellValue(fieldClassCalendar) == null) {
  //                   if (totalRecordsAdd < maxCreate) {
  //                     totalRecordsAdd++;
  //                   } else break;
  //                   updateData.push({
  //                     id: record.id,
  //                     fields: { "Lớp học": [{ id: newClassId }] },
  //                   });
  //                 } else {
  //                   if (
  //                     record.getCellValue(fieldClassCalendar)[0].id ==
  //                     newClassId
  //                   ) {
  //                     console.log();
  //                   } else {
  //                     duplicateWithAnother = true;
  //                   }
  //                 }
  //               }
  //             }
  //           }

  //           // Nếu giáo viên bị trùng lịch với học viên khác hoặc đã tới giới hạn số lớp trong khóa thì hủy vòng lặp
  //           if (duplicateWithAnother || total >= maxCreate) {
  //             // 2 trường hợp này là 2 trường hợp kết thúc khác nên đặt missCalendar lại bằng null
  //             missCalendar = null;
  //             break;
  //           }
  //         }
  //         break;
  //       }
  //     }
  //     if (missCalendar != null) break;
  //     for (const dayGV2 of teacher2Schedule) {
  //       if (dayOfWeekVietnam[d.getDay()] === dayGV2.day) {
  //         // Gán tên ngày học để tí nữa in ra ngày bị thiếu
  //         missCalendar = d.toISOString().slice(0, 10);
  //         const dayStudent = new Date(d).toISOString().substring(0, 10);

  //         for (const record of recordsCalendar) {
  //           const recordTeacher =
  //             record.getCellValue(fieldTeacherCalendar) != null
  //               ? record.getCellValue(fieldTeacherCalendar)[0].id
  //               : "Lỗi không có dữ liệu";

  //           if (recordTeacher == linkedTeacher2[0].id) {
  //             const dayTeacher =
  //               record.getCellValue(fieldDateTimeCalendar) != null
  //                 ? record.getCellValue(fieldDateTimeCalendar).substring(0, 10)
  //                 : "Lỗi không có dữ liệu";

  //             if (dayStudent == dayTeacher) {
  //               const checkTime = new Date(
  //                 record.getCellValue(fieldDateTimeCalendar)
  //               ).getUTCHours();

  //               if (checkTime == valueGV2) {
  //                 total++;

  //                 // Nếu có lịch thì gán lại bằng Null
  //                 missCalendar = null;
  //                 // Nếu giáo viên vẫn trống lịch thì thêm lớp học vào record
  //                 if (record.getCellValue(fieldClassCalendar) == null) {
  //                   if (totalRecordsAdd < maxCreate) {
  //                     totalRecordsAdd++;
  //                   } else break;
  //                   updateData.push({
  //                     id: record.id,
  //                     fields: { "Lớp học": [{ id: newClassId }] },
  //                   });
  //                 } else {
  //                   if (
  //                     record.getCellValue(fieldClassCalendar)[0].id ==
  //                     newClassId
  //                   ) {
  //                     console.log();
  //                   } else {
  //                     duplicateWithAnother = true;
  //                   }
  //                 }
  //               }
  //             }
  //           }

  //           // Nếu giáo viên bị trùng lịch với học viên khác hoặc đã tới giới hạn số lớp trong khóa thì hủy vòng lặp
  //           if (duplicateWithAnother || total >= maxCreate) {
  //             // 2 trường hợp này là 2 trường hợp kết thúc khác nên đặt missCalendar lại bằng null
  //             missCalendar = null;
  //             break;
  //           }
  //         }
  //         break;
  //       }
  //     }
  //     if (missCalendar != null) break;
  //   }

  //   // Tách ra từng phần để tránh quá nhiều hành động trong 1s
  //   if (missCalendar == null) {
  //     if (!duplicateWithAnother && updateData.length > 0) {
  //       let startCreate = 0;
  //       let count = updateData.length;
  //       while (count > 0) {
  //         const maxCreate = 46;
  //         tableCalendar.updateRecordsAsync(
  //           updateData.slice(startCreate, startCreate + maxCreate)
  //         );

  //         count = count - maxCreate;
  //         startCreate = startCreate + maxCreate;
  //       }

  //       setMessage("Cập nhật " + totalRecordsAdd + " lịch thành công");
  //     } else {
  //       setMessage("Giáo viên được chọn không có đủ lịch trống");
  //     }
  //   } else setMessage("Giáo viên được chọn thiếu lịch vào " + missCalendar);
  // };
  return (
    <Box border="thick" padding={3} margin={1}>
      {recordClassSelected == null ? 
        <Text 
          style={{
            marginTop: 15,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Chưa có lớp mới
        </Text> :
        <Box>
        <Box>
          <SelectList 
              obj={selectListClass} 
              value={classSelected} 
              setValue={setClassSelected} 
              
            />
            <Box
            border="thick"
            marginTop={1}
            marginBottom={1}
            paddingLeft='5px'
            paddingTop='15px'
          >
            <Text
              style={{
                marginBottom: 15,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Thông tin lớp học:
            </Text>
          <Box style={{display: "flex"}}>
              {/* Left Container */}
            <Box style={{marginRight: "100px"}}>
              {
                recordClassSelected.getCellValue(fieldClassType).name == 'Official - 1ONGROUP' ? 
                <Box style={{ display: "flex", alignItems: "center"}}>
                <Text style={{
                    marginRight: 6,
                    fontSize: 14,
                    fontWeight: "bold", 
                  }}>
                  Khóa học: 
                </Text>
                {recordClassSelected.getCellValue(fieldClassCourse) != null ? (
                  <CellRenderer
                    field={fieldClassCourse}
                    record={recordClassSelected}
                  />
                ) : (
                  <Text>Chưa chọn khóa học</Text>
                )}
              </Box> :
              <div />
              }
              <Box style={{display: "flex", alignItems: "center"}}>
                <Text style={{
                    marginRight: 6,
                    fontSize: 14,
                    fontWeight: "bold", 
                  }}>
                  Hình thức buổi học: 
                </Text>
                {recordClassSelected.getCellValue(fieldClassType) != null ? (
                  <CellRenderer
                    field={fieldClassType}
                    record={recordClassSelected}
                  />
                ) : (
                  <Text>Chưa chọn hình thức học</Text>
                )}
              </Box>
              <Box style={{display: "flex", alignItems: "center", marginTop: '10px' }}>
                <Text style={{
                    marginRight: 6,
                    fontSize: 14,
                    fontWeight: "bold", 
                  }}>
                  Thời lượng học: 
                </Text>
                {recordClassSelected.getCellValue(fieldClassLong) != null ? (
                  <Text>{recordClassSelected.getCellValue(fieldClassLong)} phút</Text>
                ) : (
                  <Text>Chưa chọn thời lượng buổi học</Text>
                )}
              </Box>
              <Box style={{ display: "flex", alignItems: "center" , marginTop: '10px' }}>
                <Text style={{
                      marginRight: 6,
                      fontSize: 14,
                      fontWeight: "bold", 
                    }}>
                    Giáo viên dạy: 
                </Text>
                {recordClassSelected.getCellValue(fieldClassTeachers) != null ? (
                  <CellRenderer
                  field={fieldClassTeachers}
                  record={recordClassSelected}
                />
                ) : (
                  <Text>Chưa chọn giáo viên cho lớp học</Text>
                )}
              </Box>
              <Box style={{ display: "flex", alignItems: "center" }}>
                <Text style={{
                      marginRight: 6,
                      fontSize: 14,
                      fontWeight: "bold", 
                    }}>
                    Học viên: 
                </Text>
                {recordClassSelected.getCellValue(fieldClassStudents) != null ? (
                  <CellRenderer
                  field={fieldClassStudents}
                  record={recordClassSelected}
                />
                ) : (
                  <Text>Chưa có học viên trong lớp</Text>
                )}
              </Box>
            </Box>
            {/* Right Container */}
            <Box>
                <Box style={{display: "flex", alignItems: "center"}}>
                  <Text style={{
                      marginRight: 6,
                      fontSize: 14,
                      fontWeight: "bold", 
                    }}>
                    Giờ học chính thức: 
                  </Text>
                  {recordClassSelected.getCellValue(fieldClassTimeTeach) != null ? (
                    <CellRenderer
                      field={fieldClassTimeTeach}
                      record={recordClassSelected}
                    />
                  ) : (
                    <Text>Chưa chọn giờ học chính thức</Text>
                  )}
                </Box>
                <Box style={{display: "flex", alignItems: "center"}}>
                  <Text style={{
                      marginRight: 6,
                      fontSize: 14,
                      fontWeight: "bold", 
                    }}>
                    Ngày học chính thức: 
                  </Text>
                  {recordClassSelected.getCellValue(fieldClassDayTeach) != null ? (
                    <CellRenderer
                      field={fieldClassDayTeach}
                      record={recordClassSelected}
                    />
                  ) : (
                    <Text>Chưa chọn ngày học chính thức</Text>
                  )}
                </Box>
                { recordClassSelected.getCellValue(fieldClassCourse)[0].includes("mất gốc") ? 
                  <div /> :
                  <Box style={{display: "flex", alignItems: "center"}}>
                  <Text style={{
                      marginRight: 6,
                      fontSize: 14,
                      fontWeight: "bold", 
                    }}>
                    Phân bổ lịch: 
                  </Text>
                  {recordClassSelected.getCellValue(fieldClassDistributeSchedule) != null ? (
                    <CellRenderer
                      field={fieldClassDistributeSchedule}
                      record={recordClassSelected}
                    />
                  ) : (
                    <Text>Chưa phân bổ lịch cho giáo viên</Text>
                  )}
                </Box>
                }
              </Box>
          </Box>
          </Box> 
        </Box>

        {/* Chọn thời gian dạy */}
        {recordClassSelected.getCellValue(fieldClassCourse)[0].includes("mất gốc") ? 
          <div /> :
          <Box>
            <Text size="large" marginTop={2} marginBottom={1}>
              Giáo viên {recordClassSelected.getCellValue(fieldClassTeachers)[0].name}:
            </Text>
            <Box display="flex" marginTop={2} marginLeft={2} flexWrap="wrap">
              {selectDayCheckBox(
                recordClassSelected.getCellValue(fieldClassDayTeach),
                "gv1",
                )}
            </Box>
            <Text size="large" marginTop={2} marginBottom={1}>
              Giáo viên {recordClassSelected.getCellValue(fieldClassTeachers)[1].name}:
            </Text>
            <Box display="flex" marginTop={2} marginLeft={2} flexWrap="wrap">
            {selectDayCheckBox(
                recordClassSelected.getCellValue(fieldClassDayTeach),
                "gv2",
                )}
            </Box>
          </Box>
        }
        {/* Chọn thời gian bắt đầu và kết thúc  */}
        <Text size="large" marginTop={3}>
          Thời gian:
        </Text>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginBottom={3}
          marginTop={1}
          maxWidth={400}
        >
          <Input
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              const date = new Date(e.target.value);
              setEndDate(
                new Date(date.setMonth(date.getMonth() + 3))
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
            disabled
          />
        </Box>
        <Button
          style={{
            marginTop: 12,
            backgroundColor: "#7572ed",
            color: "white",
            fontSize: 16,
          }}
          onClick={async () => {
            if (startDate == "" || endDate == "") {
              setMessage("Bạn vui lòng nhập đầy đủ thông tin");
            } else if (new Date(startDate) >= new Date(endDate)) {
              setMessage("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
            } else if (
              recordClassSelected.getCellValue(fieldClassTimeTeach) == null ||
              recordClassSelected.getCellValue(fieldClassDayTeach) == null
            ) {
              setMessage("Học viên chưa đăng ký ngày hoặc giờ học");
            } else {
              if (recordClassSelected.getCellValue(fieldClassTeachers).length == 1) {
                await createStudentCalendarWith1Teacher();
              } else {
                await createStudentCalendarWith2Teacher();
              }
            }
            setIsDialogOpen(true);
          }}
        >
          Tạo lịch
        </Button>
        {isDialogOpen && (
          <ShowDialog setIsDialogOpen={setIsDialogOpen} message={message} />
        )}
      </Box> 
      }
    </Box>
  );
}

function setDefaultIfNull(arr) {
  if (arr.length === 0) return [{ value: null, label: "Không có" }];
  else return arr;
}

function selectDayCheckBox(daysSelect, id) {
  return daysSelect != null
    ? daysSelect.map((daySelect,i) => {
        return (
          <Box
            marginRight={4}
            key={id + daySelect.name}
            id={id + daySelect.name}
            minWidth="120"
            marginBottom={1}
            style={{ color: "gray" }}
          >
            <label
              style={{
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {daySelect.name}
              <input
                key={id + daySelect.name}
                type="checkbox"
                className={id}
                name={daySelect.name}
                onChange={() => {
                  let inputOnChange = document.getElementById(
                    id + daySelect.name
                  );
                  let inputCheck = inputOnChange.querySelector("label input");

                  // Đổi màu khi được chọn
                  inputOnChange.style.color = inputCheck.checked
                    ? "blue"
                    : "gray";
                }}
              />
            </label>
          </Box>
        );
      })
    : "";
}

function getTimeInString(time) {
  return time.split(" - ")[0].slice(0, -1);
}

export default StudentCalendar;

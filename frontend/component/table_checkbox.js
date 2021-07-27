import { Box } from "@airtable/blocks/ui";
import React from "react";
import { dayOfWeek } from "../constrants";

const timeWork = { startTime: 9, endTime: 23 };

function TableCheckbox({ listSelected, setListSelected }) {
  let htmlHeader = [];
  for (let i = timeWork.startTime; i < timeWork.endTime; i++) {
    if (i == timeWork.startTime) {
      htmlHeader.push(<th style={{}} key={i - 1}></th>);
    }
    // 12h-1h là giờ nghỉ trưa
    if (i != 12) {
      htmlHeader.push(
        <th style={styles.title} key={i}>
          {i}h - {i + 1}h
        </th>
      );
    }
  }

  const html = dayOfWeek.map((e, index) => (
    <tr
      style={
        index % 2 == 0
          ? index != 0
            ? { backgroundColor: "white" }
            : { backgroundColor: "#d2d2d2" }
          : { backgroundColor: "#d2d2d2" }
      }
      key={index}
    >
      <td style={styles.side_title}>{e}</td>
      <HtmlCheckbox
        day={e}
        listSelected={listSelected}
        setListSelected={setListSelected}
      />
    </tr>
  ));
  html.push(html.shift());

  return (
    <Box>
      <table style={styles.border}>
        <tbody>
          <tr>{htmlHeader}</tr>
          {html}
        </tbody>
      </table>
    </Box>
  );
}

const styles = {
  border: {
    border: "2px solid #a5a5a5",
    borderCollapse: "collapse",
  },
  title: {
    backgroundColor: "green",
    minWidth: 80,
    border: "2px solid #a5a5a5",
    borderCollapse: "collapse",
    color: "white",
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 4,
    paddingBottom: 4,
    textAlign: "center",
    fontWeight: "bold",
  },
  side_title: {
    minWidth: 70,
    border: "2px solid #a5a5a5",
    borderCollapse: "collapse",
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 4,
    paddingBottom: 4,
    textAlign: "center",
    fontWeight: "bold",
  },
  checkbox_cell: {
    border: "2px solid #a5a5a5",
    borderCollapse: "collapse",
    textAlign: "center",
  },
};

function HtmlCheckbox({ day, listSelected, setListSelected }) {
  const listCheckbox = [];

  for (let i = timeWork.startTime; i < timeWork.endTime; i++) {
    if (i != 12) {
      listCheckbox.push(
        <td style={styles.checkbox_cell} key={i}>
          <input
            type="checkbox"
            onChange={() => {
              let isContain = false;

              listSelected.forEach((item, index) => {
                if (item.time === i && item.day === day) {
                  setListSelected(listSelected.splice(index, 1));
                  isContain = true;
                }
              });

              if (!isContain)
                setListSelected([...listSelected, { time: i, day: day }]);
              else setListSelected([...listSelected]);
            }}
          />
        </td>
      );
    }
  }
  return listCheckbox;
}

export default TableCheckbox;

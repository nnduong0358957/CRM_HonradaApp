import { Dialog, Heading, Text, Button } from "@airtable/blocks/ui";
import React from "react";

function ShowDialog({ setIsDialogOpen, message }) {
  return (
    <Dialog onClose={() => setIsDialogOpen(false)} width="320px">
      <Dialog.CloseButton />
      <Heading>Thông báo</Heading>
      <Text variant="paragraph">{message}</Text>
      <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
    </Dialog>
  );
}

export default ShowDialog;

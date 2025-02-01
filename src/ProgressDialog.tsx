import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Badge,
  Fab,
} from "@mui/material";
import { useMemo, useState, forwardRef } from "react";
import { TransferTask, useTransferQueue } from "./app/transferQueue";
import { humanReadableSize } from "./app/utils";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  PendingOutlined as PendingIcon,
} from "@mui/icons-material";

function ProgressDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);
  const transferQueue: TransferTask[] = useTransferQueue();

  const tasks = useMemo(() => {
    const taskType = tab === 0 ? "download" : "upload";
    return Object.values(transferQueue).filter(
      (task) => task.type === taskType
    );
  }, [tab, transferQueue]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Progress</DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, newTab) => setTab(newTab)}
        sx={{ "& .MuiTab-root": { flexBasis: "50%" } }}
      >
        <Tab label="Downloads" />
        <Tab label="Uploads" />
      </Tabs>
      {tasks.length === 0 ? (
        <DialogContent>
          <Typography textAlign="center" color="text.secondary">
            No tasks
          </Typography>
        </DialogContent>
      ) : (
        <DialogContent sx={{ padding: 0 }}>
          <List>
            {tasks.map((task) => (
              <ListItem key={task.name}>
                <ListItemText
                  primary={task.name}
                  secondary={`${humanReadableSize(
                    task.loaded
                  )} / ${humanReadableSize(task.total)}`}
                />
                {task.status === "failed" ? (
                  <Tooltip title={task.error.message}>
                    <ErrorOutlineIcon color="error" />
                  </Tooltip>
                ) : task.status === "completed" ? (
                  <CheckCircleOutlineIcon color="success" />
                ) : task.status === "in-progress" ? (
                  <CircularProgress
                    variant="determinate"
                    size={24}
                    value={(task.loaded / task.total) * 100}
                  />
                ) : null}
              </ListItem>
            ))}
          </List>
        </DialogContent>
      )}
    </Dialog>
  );
}

export const ProgressFab = forwardRef<HTMLButtonElement, { onClick: () => void }>(
  function ({ onClick }, ref) {
    const transferQueue = useTransferQueue();
    const activeTransfers = transferQueue.filter(
      task => task.status === "pending" || task.status === "in-progress"
    );

    if (activeTransfers.length === 0) return null;

    return (
      <Fab
        ref={ref}
        aria-label="Show Progress"
        variant="circular"
        color="secondary"
        size="large"
        sx={{ position: "fixed", right: 16, bottom: 88 }}
        onClick={onClick}
      >
        <Badge badgeContent={activeTransfers.length} color="error">
          <PendingIcon />
        </Badge>
      </Fab>
    );
  }
);

export default ProgressDialog;

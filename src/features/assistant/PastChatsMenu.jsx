import { useState } from "react";

import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import ForumIcon from "@mui/icons-material/Forum";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import { useLanguage } from "../../context/LanguageContext";
import {
  deleteArchivedChat,
  listArchivedChats,
} from "../../services/chatStore";
import { formatDate } from "../../services/historyStore";

/*
 * Past conversations.
 *
 * Starting a new conversation archives the old one rather than
 * discarding it, and this menu reopens or removes them.
 */
function PastChatsMenu({ onRestore }) {
  const { t } = useLanguage();

  const [anchorEl, setAnchorEl] = useState(null);
  const [chats, setChats] = useState([]);

  const open = (event) => {
    setChats(listArchivedChats());
    setAnchorEl(event.currentTarget);
  };

  const close = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title={t("assistant.pastChatsTooltip")}>
        <IconButton onClick={open}>
          <ForumIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        slotProps={{
          paper: { sx: { borderRadius: 3, minWidth: 288, maxWidth: 360 } },
        }}
      >
        <Typography
          variant="caption"
          sx={{ px: 2, py: 1, display: "block", fontWeight: 800, color: "#64748B" }}
        >
          {t("assistant.pastChatsTitle")}
        </Typography>

        <Divider />

        {!chats.length ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" sx={{ color: "#94A3B8" }}>
              {t("assistant.pastChatsEmpty")}
            </Typography>
          </Box>
        ) : (
          chats.map((chat) => (
            <MenuItem
              key={chat.id}
              onClick={() => {
                onRestore(chat);
                close();
              }}
              sx={{ alignItems: "flex-start", py: 1.2, whiteSpace: "normal" }}
            >
              <Stack direction="row" spacing={1} sx={{ width: "100%", alignItems: "center" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {chat.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                    {formatDate(chat.savedAt, true)} ·{" "}
                    {t("assistant.pastChatsMessages", { count: chat.messageCount })}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    setChats(deleteArchivedChat(chat.id));
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}

export default PastChatsMenu;

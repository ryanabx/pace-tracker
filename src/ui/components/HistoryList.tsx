import React from 'react';
import { Box, List, ListItem, ListItemText, IconButton, Typography, useTheme } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface HistoryListProps {
    pressTimes: number[];
    displayCount: number;
    onShowMore: () => void;
    onShowLess: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({
    pressTimes,
    displayCount,
    onShowMore,
    onShowLess,
}) => {
    const theme = useTheme();
    const reversedTimes = [...pressTimes].reverse();
    const timesToDisplay = reversedTimes.slice(0, displayCount);
    const hasMore = reversedTimes.length > displayCount;

    return (
        <>
            <List dense>
                {timesToDisplay.map((time, index) => (
                    <ListItem
                        key={`${time}-${index}`}
                        sx={{
                            bgcolor: (t: typeof theme) => t.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                            borderRadius: 1,
                            mb: 0.5,
                        }}
                    >
                        <ListItemText
                            primary={new Date(time).toLocaleString()}
                            secondary={
                                pressTimes.length > 1 && index > 0
                                    ? `Interval: ${formatInterval(
                                          reversedTimes[index - 1],
                                          time
                                      )}`
                                    : undefined
                            }
                        />
                    </ListItem>
                ))}
            </List>

            {/* Show More / Show Less */}
            {hasMore && (
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <IconButton onClick={onShowMore} color="primary">
                        <KeyboardArrowDownIcon />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        Show More
                    </Typography>
                </Box>
            )}
            {pressTimes.length > displayCount && !hasMore && (
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <IconButton onClick={onShowLess} color="primary">
                        <KeyboardArrowUpIcon />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        Show Less
                    </Typography>
                </Box>
            )}
        </>
    );
};

const formatInterval = (timestamp1: number, timestamp2: number): string => {
    const diff = timestamp1 - timestamp2;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
};

export default HistoryList;

import React from 'react';
import { IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface TrackerHeaderProps {
    trackerName: string;
    onPrev: () => void;
    onNext: () => void;
}

const TrackerHeader: React.FC<TrackerHeaderProps> = ({ trackerName, onPrev, onNext }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
        }}>
            <IconButton onClick={onPrev} sx={{ color: 'primary.main' }}>
                <ArrowBackIcon />
            </IconButton>
            <Typography
                variant="h4"
                sx={{
                    flexGrow: 1,
                    textAlign: 'center',
                    color: 'primary.main',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {trackerName}
            </Typography>
            <IconButton onClick={onNext} sx={{ color: 'primary.main' }}>
                <ArrowForwardIcon />
            </IconButton>
        </div>
    );
};

export default TrackerHeader;

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { formatTime, calculateAverage, getTimeSinceLastClick } from '../../core/tracker';

interface MetricsDisplayProps {
    pressTimes: number[];
    now: number;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ pressTimes, now }) => {
    const overallAverage = pressTimes.length >= 2 ? calculateAverage(pressTimes) : 0;
    const lastTen = pressTimes.slice(-10);
    const lastTenAverage = lastTen.length >= 2 ? calculateAverage(lastTen) : 0;
    const timeSinceLast = pressTimes.length > 0 ? getTimeSinceLastClick(pressTimes) : -1;

    const MetricCard: React.FC<{ title: string; value: React.ReactNode; subtitle?: string }> = ({
        title,
        value,
        subtitle,
    }) => (
        <Card
            sx={{
                flex: '1 1 30%',
                minWidth: { xs: '100%', sm: 140 },
                mx: { xs: 0, sm: 0.5 },
                my: 0.5,
            }}
        >
            <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        lineHeight: 1.2,
                    }}
                >
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                width: '100%',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
            }}
        >
            <MetricCard
                title="Overall"
                value={pressTimes.length < 2 ? 'N/A' : formatTime(overallAverage)}
                subtitle="on average"
            />
            <MetricCard
                title="Last 10"
                value={lastTen.length < 2 ? 'N/A' : formatTime(lastTenAverage)}
                subtitle="on average"
            />
            <MetricCard
                title="Since Last"
                value={timeSinceLast < 0 ? 'No clicks yet' : formatTime(timeSinceLast)}
            />
        </Box>
    );
};

export default MetricsDisplay;

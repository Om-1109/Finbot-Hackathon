    import React from 'react';
    import styled from '@emotion/styled';
    import { Doughnut } from 'react-chartjs-2';
    import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    } from 'chart.js';
    import { theme } from '../theme'; // Import our theme

    // --- REQUIRED: Register Chart.js modules ---
    ChartJS.register(ArcElement, Tooltip, Legend);

    // --- Styled Components ---

    const ChartContainer = styled.div`
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 1.5rem auto;
    `;

    // This component uses CSS to overlay text in the center
    const CenterText = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: ${theme.colors.text};
    
    span {
        display: block;
        font-size: 0.9rem;
        color: ${theme.colors.textSecondary};
    }
    
    h3 {
        font-size: 2rem;
        font-weight: 700;
        color: ${theme.colors.primary};
        margin: 0;
    }
    `;

    // --- Component ---

    export const AllocationPieChart = ({ allocationData, projectedReturn }) => {
    // Transform our data prop into the format Chart.js expects
    const chartData = {
        labels: allocationData.map(item => item.type),
        datasets: [
        {
            data: allocationData.map(item => item.percentage),
            // Use our theme colors for the chart!
            backgroundColor: [
            theme.colors.primary,
            '#00E676', // A secondary green
            '#00C4FF', // A secondary blue
            '#FFC400', // A yellow
            ],
            borderColor: theme.colors.surface,
            borderWidth: 3,
            hoverOffset: 8,
        },
        ],
    };

    const chartOptions = {
        responsive: true,
        cutout: '70%', // This makes it a "Doughnut"
        plugins: {
        legend: {
            display: false, // We'll show the legend in our accordion
        },
        tooltip: {
            enabled: true,
        },
        },
        // This is the "draw-in" animation from your prompt
        animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1000,
        },
    };

    return (
        <ChartContainer>
        <CenterText>
            <span>Return Est.</span>
            <h3>{projectedReturn}</h3>
        </CenterText>
        <Doughnut data={chartData} options={chartOptions} />
        </ChartContainer>
    );
    };



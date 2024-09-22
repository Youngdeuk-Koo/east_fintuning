import React, { useEffect, useRef } from 'react';
import WordCloud from 'wordcloud';

interface WordCloudComponentProps {
    words: { text: string, value: number }[];
    width?: number;
    height?: number;
}

const WordCloudComponent: React.FC<WordCloudComponentProps> = ({ words = [], width = 700, height = 700 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const parentElement = canvasRef.current.parentElement;
                if (parentElement) {
                    const newWidth = parentElement.clientWidth;
                    const newHeight = parentElement.clientHeight;
                    canvasRef.current.width = newWidth;
                    canvasRef.current.height = newHeight;
                    WordCloud(canvasRef.current, {
                        list: words.map(word => [word.text, word.value]),
                        gridSize: Math.round(16 * window.devicePixelRatio),
                        weightFactor: (size: number) => Math.log(size + 1) * 10,
                        fontFamily: 'Times, serif',
                        color: () => `hsl(${Math.random() * 360}, 100%, 50%)`,
                        rotateRatio: 0.5,
                        rotationSteps: 2,
                        backgroundColor: '#fff',
                    });
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [words]);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default WordCloudComponent;
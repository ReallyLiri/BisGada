import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';

const height = Math.min(window.innerHeight - 105, 640);
const width = height * 0.5625;

const Container = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background-color: white;
  height: ${height + 105}px;
  width: ${width}px;
`;

const Canvas = styled.canvas`
  position: absolute;
  z-index: 2;
  width: ${width}px;
  height: ${height}px;
`;

const Hidden = styled.img`
  position: absolute;
  width: ${width}px;
  height: ${height}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Button = styled.button`
  position: absolute;
  top: ${height}px;
  left: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border-color: transparent;
  border-width: 0;
  outline: none;
`;

export default () => {

    let isDrawing = false;
    let lastPoint = null;
    let context = null;
    const canvasRef = useRef(null);

    const brush = new Image();
    brush.src = require('./images/brush.png');

    const coverImage = new Image();
    coverImage.src = require('./images/site-top.png');

    const getPosition = (event) => {

        let target = canvasRef.current;
        let offsetX = 0;
        let offsetY = 0;

        if (target.offsetParent !== undefined) {
            while (target = target.offsetParent) {
                offsetX += target.offsetLeft;
                offsetY += target.offsetTop;
            }
        }

        const x = (event.pageX || (event.touches ? event.touches[0].clientX : offsetX)) - offsetX;
        const y = (event.pageY || (event.touches ? event.touches[0].clientY : offsetY)) - offsetY;
        return {x, y};
    };

    const touchStart = (event) => {
        isDrawing = true;
        lastPoint = getPosition(event);
        context.globalCompositeOperation = 'destination-out';
    };

    const touchMove = (event) => {

        if (!isDrawing) {
            return;
        }
        event.preventDefault();

        const a = lastPoint;
        const b = getPosition(event);
        const dist = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        const angle = Math.atan2(b.x - a.x, b.y - a.y);
        const offsetX = brush.width / 2;
        const offsetY = brush.height / 2;

        for (let x, y, i = 0; i < dist; i++) {
            x = a.x + (Math.sin(angle) * i) - offsetX;
            y = a.y + (Math.cos(angle) * i) - offsetY;
            context.drawImage(brush, x, y);
        }

        lastPoint = b;
    };

    const touchEnd = (event) => {
        isDrawing = false;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        coverImage.onload = () => context.drawImage(coverImage, 0, 0, canvas.width, canvas.height);

        window.addEventListener('mousedown', touchStart, false);
        window.addEventListener('touchstart', touchStart, false);
        window.addEventListener('mousemove', touchMove, false);
        window.addEventListener('touchmove', touchMove, false);
        window.addEventListener('mouseup', touchEnd, false);
        window.addEventListener('touchend', touchEnd, false);

        return () => {
            window.removeEventListener('mousedown', touchStart);
            window.removeEventListener('touchstart', touchStart);
            window.removeEventListener('mousemove', touchMove);
            window.removeEventListener('touchmove', touchMove);
            window.removeEventListener('mouseup', touchEnd);
            window.removeEventListener('touchend', touchEnd);
        }
    }, []);

    return (
        <Container>
            <Canvas ref={canvasRef}/>
            <Hidden className="secret no-select" src={require('./images/site-back.png')}/>
            <Button onClick={() => window.location.reload()}>
                <img src={require('./images/refresh.png')} alt='refresh' height={100} width={100}/>
            </Button>
        </Container>
    );
}

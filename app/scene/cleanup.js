        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('click', handleClick);
          window.removeEventListener('pointerdown', handlePressStart);
          window.removeEventListener('click', handleOfficeClick);
          cancelAnimationFrame(animationFrameId);
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };

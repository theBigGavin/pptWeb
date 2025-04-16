import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SlideNode } from '../types';
import SlideNodeComponent from './nodes/SlideNode'; // Import the actual SlideNode component
import './../styles/FullscreenPresenter.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStepBackward, faStepForward, faTimes } from '@fortawesome/free-solid-svg-icons';

interface FullscreenPresenterProps {
  nodes: SlideNode[];
  initialNodeIndex?: number; // Optional starting index
  onExit: () => void; // Function to call when exiting fullscreen/presentation
}

const FullscreenPresenter: React.FC<FullscreenPresenterProps> = ({
  nodes,
  initialNodeIndex = 0,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialNodeIndex);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(3); // Default interval in seconds
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timer ID
  const slideContainerRef = useRef<HTMLDivElement>(null); // Ref for the slide container
  const [scaleFactor, setScaleFactor] = useState(1); // State for the scale factor

  // Ensure index stays within bounds when props change
  useEffect(() => {
    // Reset autoplay when initial index changes (e.g., reopening presenter)
    setIsAutoplaying(false);
    if (initialNodeIndex < 0 || initialNodeIndex >= nodes.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(initialNodeIndex);
    }
  }, [initialNodeIndex, nodes.length]);

  const currentNode = nodes[currentIndex];

  // --- Navigation Logic ---
  const goToNext = useCallback(() => {
    if (nodes.length > 0) {
       setCurrentIndex((prevIndex) => (prevIndex + 1) % nodes.length);
    }
  }, [nodes.length]);

  const goToPrev = useCallback(() => {
     if (nodes.length > 0) {
       setCurrentIndex((prevIndex) => (prevIndex - 1 + nodes.length) % nodes.length);
     }
  }, [nodes.length]);

  // --- Event Handlers ---

  // Handle Keyboard navigation (Esc, Arrows)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onExit();
    } else if (event.key === 'ArrowRight') {
      goToNext();
    } else if (event.key === 'ArrowLeft') {
      goToPrev();
    }
    // Optional: Add spacebar to toggle autoplay?
    // else if (event.key === ' ') {
    //   event.preventDefault(); // Prevent default spacebar scroll
    //   toggleAutoplay();
    // }
  }, [onExit, goToNext, goToPrev]); // Removed toggleAutoplay if not used
 
   // --- Effects ---
 
   // Add/Remove Keyboard Listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle Autoplay Timer
  useEffect(() => {
    // Clear existing timer if it exists
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    // Start new timer if autoplaying and interval is valid
    if (isAutoplaying && autoplayInterval > 0 && nodes.length > 0) {
      autoplayTimerRef.current = setInterval(() => {
        goToNext();
      }, autoplayInterval * 1000);
    }

    // Cleanup timer on component unmount or when dependencies change
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isAutoplaying, autoplayInterval, goToNext, nodes.length]);

  // Calculate Scale Factor Effect
  useEffect(() => {
    const calculateScale = () => {
      if (!slideContainerRef.current || !currentNode?.width || !currentNode?.height) {
        setScaleFactor(1); // Default scale if refs/dims aren't ready
        return;
      }

      const containerWidth = slideContainerRef.current.clientWidth;
      const containerHeight = slideContainerRef.current.clientHeight;
      // Use the actual node dimensions passed from App.tsx
      const nodeWidth = currentNode.width;
      const nodeHeight = currentNode.height;

      // Add small padding to prevent touching edges
      const padding = 40; // e.g., 20px padding on each side
      const availableWidth = containerWidth - padding;
      const availableHeight = containerHeight - padding;

      if (availableWidth <= 0 || availableHeight <= 0 || nodeWidth <= 0 || nodeHeight <= 0) {
         setScaleFactor(1); // Avoid division by zero or negative scale
         return;
      }

      const scaleX = availableWidth / nodeWidth;
      const scaleY = availableHeight / nodeHeight;

      // Use the smaller scale factor to fit entirely within the container
      const newScaleFactor = Math.min(scaleX, scaleY);
      setScaleFactor(newScaleFactor > 0 ? newScaleFactor : 1); // Ensure scale is positive
      // console.log(`Calculating scale: container=(${containerWidth},${containerHeight}), node=(${nodeWidth},${nodeHeight}), scale=${newScaleFactor}`);
    };

    calculateScale(); // Initial calculation

    // Use ResizeObserver for more reliable container resize detection
    let resizeObserver: ResizeObserver | null = null;
    if (slideContainerRef.current) {
        resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(slideContainerRef.current);
    }

    // Recalculate on window resize as a fallback or for overall layout changes
    window.addEventListener('resize', calculateScale);

    return () => {
      window.removeEventListener('resize', calculateScale);
      if (resizeObserver && slideContainerRef.current) {
        resizeObserver.unobserve(slideContainerRef.current);
      }
    };
    // Recalculate when the current node changes (because its dimensions might differ)
  }, [currentNode]);

  // --- Control Functions ---
  const toggleAutoplay = () => {
    setIsAutoplaying(!isAutoplaying);
  };

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Allow empty string to clear interval visually, treat as 0 internally
    if (value === '') {
        setAutoplayInterval(0);
        setIsAutoplaying(false); // Stop autoplay if interval is cleared
    } else {
        const newInterval = parseInt(value, 10);
        // Ensure interval is at least 1 second
        if (!isNaN(newInterval) && newInterval >= 1) {
            setAutoplayInterval(newInterval);
        } else if (!isNaN(newInterval) && newInterval <= 0) {
             setAutoplayInterval(1); // Set to minimum if user enters 0 or negative
        }
    }
  };

  // --- Rendering ---

  if (!currentNode) {
    return (
      <div className="fullscreen-presenter-overlay">
        <p>没有可预览的页面。</p>
        <button onClick={onExit} className="presenter-exit-button-standalone">
           <FontAwesomeIcon icon={faTimes} /> 退出预览
        </button>
      </div>
    );
  }

  // Prepare dummy props for SlideNodeComponent
  const dummyUpdateLayerData = useCallback(() => {}, []);
  const dummySetSelectedLayerId = useCallback(() => {}, []);
  const dummySetIsLayerPanelVisible = useCallback(() => {}, []);
  const dummySetIsPropertiesPanelVisible = useCallback(() => {}, []);

  return (
    // Add onClick for mouse navigation, stop propagation on content/controls
    <div className="fullscreen-presenter-overlay">
       <div className="presenter-content" onClick={(e) => e.stopPropagation()}>
         {/* Container for the slide, used for scaling calculations */}
         <div className="presenter-slide-container" ref={slideContainerRef}>
            {/* Inner wrapper to apply the scale transform */}
            {/* Add onClick={goToNext} to the scaled slide wrapper */}
            <div
              style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'center center', cursor: 'pointer' }} // Add cursor pointer
              onClick={goToNext} // Go to next slide when clicking the node itself
            >
              <SlideNodeComponent
                id={currentNode.id}
                // Removed direct style prop
                data={{
                  ...currentNode.data,
                  // Pass dummy functions/values for props expected by SlideNode
                  updateLayerData: dummyUpdateLayerData,
                  setSelectedLayerId: dummySetSelectedLayerId,
                  nodeId: currentNode.id,
                  selectedLayerId: null,
                  setIsLayerPanelVisible: dummySetIsLayerPanelVisible,
                  setIsPropertiesPanelVisible: dummySetIsPropertiesPanelVisible,
                }}
                // Pass other required NodeProps
                type="slideNode"
                selected={false} // Not selectable in preview
                isConnectable={false} // Not connectable in preview
                isPreviewing={true} // Indicate that this is preview mode
                xPos={0} // Position is handled by CSS transform/scaling
                yPos={0}
                zIndex={1}
                // Remove width/height props passed directly to SlideNodeComponent
                dragging={false}
                targetPosition={undefined}
                sourcePosition={undefined}
              />
            </div>
         </div>
       </div>
        {/* Enhanced Controls */}
        <div className="presenter-controls" onClick={(e) => e.stopPropagation()}>
            <button onClick={goToPrev} title="上一张 (←)">
                <FontAwesomeIcon icon={faStepBackward} />
            </button>
            <button onClick={toggleAutoplay} title={isAutoplaying ? "暂停" : "自动播放"}>
                <FontAwesomeIcon icon={isAutoplaying ? faPause : faPlay} />
            </button>
            <input
                type="number"
                value={autoplayInterval > 0 ? autoplayInterval : ''}
                onChange={handleIntervalChange}
                min="1"
                step="1"
                title="自动播放间隔 (秒)"
                className="autoplay-interval-input"
            />
            <span className="interval-unit">秒</span>
            <button onClick={goToNext} title="下一张 (→)">
                <FontAwesomeIcon icon={faStepForward} />
            </button>
            <button onClick={onExit} title="退出预览 (Esc)">
                 <FontAwesomeIcon icon={faTimes} />
            </button>
        </div>
    </div>
  );
};

export default FullscreenPresenter;
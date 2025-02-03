import Canvas from './Canvas';
import EditPanel from './EditPanel';
import LayersPanel from './LayersPanel';
import Toolbar from './Toolbar';
import EditorTopBar from './TopBar';
import WebviewArea from './WebviewArea';

function ProjectEditor() {
    return (
        <>
            <div className="relative flex flex-row h-[calc(100vh-2.75rem)] select-none">
                <Canvas>
                    <WebviewArea />
                </Canvas>

                <div className="fixed top-20 left-0 h-[calc(100%-5rem)] animate-layer-panel-in">
                    <LayersPanel />
                </div>

                <div className="fixed top-20 right-0 h-[calc(100%-5rem)] animate-edit-panel-in">
                    <EditPanel />
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-toolbar-up">
                    <Toolbar />
                </div>

                <div className="absolute top-0 w-full">
                    <EditorTopBar />
                </div>
            </div>
        </>
    );
}

export default ProjectEditor;

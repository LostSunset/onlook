import type { ImageMessageContext } from '@onlook/models/chat';
import { MainChannels } from '@onlook/models/constants';
import { makeAutoObservable } from 'mobx';
import { ProjectTabs, type ProjectsManager } from '.';
import { invokeMainChannel, sendAnalytics } from '../utils';

export enum CreateState {
    PROMPT = 'prompting',
    IMPORT = 'import',
    CREATE_LOADING = 'create-loading',
    ERROR = 'error',
}

export class CreateManager {
    createState: CreateState = CreateState.PROMPT;
    progress: number = 0;
    message: string | null = null;
    error: string | null = null;
    private cleanupListener: (() => void) | null = null;

    constructor(private projectsManager: ProjectsManager) {
        makeAutoObservable(this);
        this.listenForPromptProgress();
    }

    listenForPromptProgress() {
        window.api.on(
            MainChannels.CREATE_NEW_PROJECT_PROMPT_CALLBACK,
            ({ message, progress }: { message: string; progress: number }) => {
                this.progress = progress;
                this.message = message;
            },
        );

        this.cleanupListener = () => {
            window.api.removeAllListeners(MainChannels.CREATE_NEW_PROJECT_PROMPT_CALLBACK);
        };

        return this.cleanupListener;
    }

    get state() {
        return this.createState;
    }

    set state(newState: CreateState) {
        this.createState = newState;
    }

    async sendPrompt(prompt: string, images: ImageMessageContext[]) {
        sendAnalytics('prompt create project', {
            prompt,
        });
        this.state = CreateState.CREATE_LOADING;
        this.error = null;
        const result: {
            success: boolean;
            response?: {
                projectPath?: string;
                content?: string;
            };
            error?: string;
        } = await invokeMainChannel(MainChannels.CREATE_NEW_PROJECT_PROMPT, {
            prompt: prompt,
            images: images,
        });

        if (result.success && result.response?.projectPath) {
            this.state = CreateState.PROMPT;
            const newProject = this.createProject(result.response.projectPath);
            this.projectsManager.project = newProject;
            setTimeout(() => {
                this.projectsManager.projectsTab = ProjectTabs.PROJECTS;
            }, 100);

            // Generate suggestions
            if (result.response?.content) {
                this.projectsManager.editorEngine?.chat.suggestions.generateCreatedSuggestions(
                    prompt,
                    result.response.content,
                    images,
                );
            }

            setTimeout(() => {
                this.projectsManager.runner?.start();
            }, 1000);
            sendAnalytics('prompt create project success');
        } else {
            this.error = result.error || 'Failed to create project';
            this.state = CreateState.ERROR;
            sendAnalytics('prompt create project error', {
                error: this.error,
            });
        }
    }

    createProject(projectPath: string) {
        const projectName = 'New Project';
        const projectUrl = 'http://localhost:3000';
        const projectCommands = {
            run: 'npm run dev',
            build: 'npm run build',
        };

        return this.projectsManager.createProject(
            projectName,
            projectUrl,
            projectPath,
            projectCommands,
        );
    }

    async cancel() {
        await invokeMainChannel(MainChannels.CANCEL_CREATE_NEW_PROJECT_PROMPT);
        this.state = CreateState.PROMPT;
    }

    cleanup() {
        if (this.cleanupListener) {
            this.cleanupListener();
            this.cleanupListener = null;
        }
    }
}

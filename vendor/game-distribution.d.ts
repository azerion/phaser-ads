interface IGameDistributionSettings {
    gameId: string;
    userId: string;
    resumeGame: () => void;
    pauseGame: () => void;
    onInit: (data: any) => void;
    onError: (data: any) => void;
}

declare var gdApi: any;
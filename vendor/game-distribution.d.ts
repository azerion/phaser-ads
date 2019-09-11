interface IGameDistributionSettings {
    gameId: string;
    userId?: string;
    onEvent?: (event: any) => void;
}

declare var gdsdk: any;
declare var GD_OPTIONS: IGameDistributionSettings;

interface IGameDistributionSettings {
    gameId: string;
    userId: string;
    onEvent: (event: any) => void;
}

declare var gdApi: any;
declare var GD_OPTIONS: IGameDistributionSettings;
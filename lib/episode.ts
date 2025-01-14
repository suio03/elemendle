interface ArcInfo {
    name: string;
    label: string;
    startEpisode: number;
    endEpisode: number | 'ongoing';
}

export function getArcNameByEpisode(episodeNumber: number) {
    const arcs: ArcInfo[] = [
        { name: "Substitute Arc", label: "Agent of the Shinigami Arc", startEpisode: 1, endEpisode: 20 },
        { name: "Soul Society Arc", label: "Soul Society: The Sneak Entry Arc", startEpisode: 21, endEpisode: 41 },
        { name: "Rescue Arc", label: "Soul Society: The Rescue Arc", startEpisode: 42, endEpisode: 63 },
        { name: "Bount Arc",     label: "The Bount Arc", startEpisode: 64, endEpisode: 91 },
        { name: "Arrancar Arc",  label: "Arrancar: The Arrival Arc", startEpisode: 110, endEpisode: 131 },
        { name: "Hueco Mundo Arc", label: "Arrancar: The Hueco Mundo Sneak Entry Arc", startEpisode: 132, endEpisode: 151 },    
        { name: "Bount Assault Arc", label: "Bount Assault on Soul Society Arc", startEpisode: 92, endEpisode: 109 },
        { name: "Fierce Fight Arc", label: "Arrancar: The Fierce Fight Arc", startEpisode: 152, endEpisode: 167 },
        { name: "Amagai Arc", label: "The New Captain Shūsuke Amagai Arc", startEpisode: 168, endEpisode: 189 },
        { name: "VS Arc", label: "Arrancar vs. Shinigami Arc", startEpisode: 190, endEpisode: 205 },
        { name: "Turn Back Arc", label: "The Past Arc", startEpisode: 206, endEpisode: 212 },
        { name: "Fake Karakura Arc", label: "Arrancar: Decisive Battle of Karakura Arc", startEpisode: 213, endEpisode: 229 },
        { name: "Zanpakuto Arc", label: "Zanpakutō Unknown Tales Arc", startEpisode: 230, endEpisode: 265 },
        { name: "Arrancar Fall Arc", label: "Arrancar: Downfall Arc", startEpisode: 266, endEpisode: 316 },
        { name: "Gotei 13 Arc", label: "Gotei 13 Invading Army Arc", startEpisode: 317, endEpisode: 342 },
        { name: "Fullbring Arc", label: "The Lost Substitute Shinigami Arc", startEpisode: 343, endEpisode: 366 },
        { name: "TYBW Arc", label: "The Thousand-Year Blood War Arc", startEpisode: 367, endEpisode: 'ongoing' },
    ];

    // Input validation
    if (!Number.isInteger(episodeNumber) || episodeNumber < 1) {
        throw new Error("Episode number must be a positive integer");
    }

    const arc = arcs.find(arc => {
        if (arc.endEpisode === 'ongoing') {
            return episodeNumber >= arc.startEpisode;
        }
        return episodeNumber >= arc.startEpisode && episodeNumber <= arc.endEpisode;
    });

    return arc ? arc : { name: "Episode not found in any arc", label: "", startEpisode: 0, endEpisode: 0 };
}
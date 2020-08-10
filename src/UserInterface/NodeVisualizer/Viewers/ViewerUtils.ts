import Viewer from '@/UserInterface/Components/Viewers/Viewer';

export default class ViewerUtils {
    private static viewers: { [key: string]: Viewer } = {};

    public static addViewer(key: string, viewer: Viewer): void {
      ViewerUtils.viewers[key] = viewer;
    }

    public static getViewers(): { [key: string]: Viewer; } {
      return ViewerUtils.viewers;
    }
}
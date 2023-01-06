import ManagerItem from './ManagerItem';

export default abstract class Manager<T extends ManagerItem> {
    protected items: T[] = [];
    protected abstract managerType: string;
    protected removeItem = (item: ManagerItem) => {
        const index = this.items.indexOf(item as T);
        if (index != -1) {
            this.items.splice(index, 1);
        }
    };

    protected addItem(item: T) {
        item.setRemoveFromManagerCb(this.removeItem);
        this.items.push(item);
    }
}

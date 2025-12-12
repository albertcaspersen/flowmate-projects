import { defineStore } from 'pinia'

export const useModalStore = defineStore('ModalStore', {
    state: () => {
        return {
          isActive: false
        }
    },
    getters: {
        modalActive(state) {
            return state.isActive;
        }
    },
    actions: {
        toggleModalActive(){
            this.isActive = !this.isActive;
            if (this.isActive) {
                document.documentElement.style.overflow = "hidden";
            } else {
                document.documentElement.style.overflow = "auto";
            }
        }
    }
});

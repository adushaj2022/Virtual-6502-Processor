import PriorityQueue from 'javascript-priority-queue';
import { priority } from '../Priority';

export interface Interrupt {
    irq : number;
    priority : priority;
    name : string;
    output_buffer : PriorityQueue;
}

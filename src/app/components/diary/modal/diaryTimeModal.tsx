"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { DiaryTimeFormData } from "../type";
import { Button } from "@/components/ui/button";

interface DiaryTimeModalProps {
    open: boolean;
    onClose: () => void;
    register: UseFormRegister<DiaryTimeFormData>;
    errors: FieldErrors<DiaryTimeFormData>;
}

const DiaryTimeModal = ({ open, onClose, register, errors }: DiaryTimeModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Diary Time</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-2">
                    <Input className="w-full" type="date" placeholder="날짜" {...register("date")} />
                    {errors.date && <p className="text-sm text-red-500">{errors.date?.message}</p>}
                </div>
                <div>
                    {<Input id="diaryTime" type="time" {...register("time")} />}
                    {errors.time && <p className="text-sm text-red-500">{errors.time?.message}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="default" onClick={onClose}>
                        확인
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DiaryTimeModal;

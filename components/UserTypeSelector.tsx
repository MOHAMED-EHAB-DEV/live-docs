import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const typeLabels: Record<string, string> = {
  viewer: "can view",
  editor: "can edit",
};

const UserTypeSelector = ({
  userType = "viewer",
  setUserType,
  onClickHandler,
}: UserTypeSelectorParams) => {
  const selectedType = userType || "viewer";

  const accessChangeHandler = (type: UserType) => {
    setUserType(type);
    onClickHandler && onClickHandler(type);
  };

  return (
    <Select
      value={selectedType}
      defaultValue={selectedType}
      onValueChange={(type: string) => accessChangeHandler(type as UserType)}
    >
      <SelectTrigger className="border-0 bg-transparent text-blue-100 shadow-none hover:bg-dark-300/50 focus-visible:ring-0">
        <SelectValue placeholder={typeLabels[selectedType] || "can view"} />
      </SelectTrigger>
      <SelectContent position="bottom-right">
        <SelectItem value="viewer">can view</SelectItem>
        <SelectItem value="editor">can edit</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserTypeSelector;

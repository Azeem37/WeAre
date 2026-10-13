export default interface Parent {
  first_name: string;
  last_name: string;
  adhar: string;
  student_ids: string[];
  register_no: string;
  id?: string;
}

export default interface Student {
  first_name: string;
  last_name: string;
  adhar: string;
  parent_id: string;
  register_no: string;
  id?: string;
  attendance?: string;
  class: string;
  exams?: string[];
}

export type ids = {};
